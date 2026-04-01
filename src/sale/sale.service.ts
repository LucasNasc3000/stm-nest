import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Decimal from 'decimal.js';
import { TokenPayloadDTO } from 'src/auth/dto/token-payload.dto';
import { OutflowReason } from 'src/common/enums/outflow-reason.enum';
import { OutflowType } from 'src/common/enums/outflow-type.enum';
import { Action, Resource } from 'src/common/enums/permissions.enum';
import { SaleStatus } from 'src/common/enums/sale-status.enum';
import { EmployeeService } from 'src/employee/employee.service';
import { Employee } from 'src/employee/entities/employee.entity';
import { Outflow } from 'src/outflow/entities/outflow.entity';
import { Formatter } from 'src/utils/format-timezone';
import {
  Between,
  DataSource,
  In,
  Like,
  QueryRunner,
  Repository,
} from 'typeorm';
import { Product } from '../product/entities/product.entity';
import { CreateSaleDTO } from './dto/create-sale.dto';
import { PaginationByAddressDTO } from './dto/pagination-address.dto';
import { PaginationByClientNameDTO } from './dto/pagination-client-name.dto';
import { PaginationByDateDTO } from './dto/pagination-date.dto';
import { PaginationByEmployeeDTO } from './dto/pagination-employee.dto';
import { PaginationByHourDTO } from './dto/pagination-hour.dto';
import { SaleStatusUpdateDTO } from './dto/sale-status.dto';
import { UpdateSaleDTO } from './dto/update-sale.dto';
import { SaleItems } from './entities/sale-items.entity';
import { Sale } from './entities/sale.entity';

@Injectable()
export class SaleService {
  constructor(
    @InjectRepository(Sale)
    private readonly salesRepository: Repository<Sale>,
    private readonly employeesService: EmployeeService,
    private dataSource: DataSource,
    private readonly logger: Logger,
  ) {}

  async Create(tokenPayloadDTO: TokenPayloadDTO, createSaleDTO: CreateSaleDTO) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const doesEmployeeReallyExists = await queryRunner.manager.findOne(
        Employee,
        {
          where: {
            id: tokenPayloadDTO.sub,
          },
        },
      );

      if (!doesEmployeeReallyExists) {
        throw new UnauthorizedException('Funcionário não encontrado');
      }

      const productsIds = createSaleDTO.saleItems.map((item) => item.product);
      const findProducts = await queryRunner.manager.find(Product, {
        where: {
          id: In(productsIds),
        },
      });

      if (findProducts.length !== productsIds.length) {
        throw new NotFoundException('Um ou mais produtos não encontrados');
      }

      const productsMap = new Map(
        findProducts.map((product) => [product.id, product]),
      );

      let totalPrice = new Decimal(0);

      for (const item of createSaleDTO.saleItems) {
        const product = productsMap.get(item.product);

        const price = new Decimal(product.price);

        totalPrice = totalPrice.add(price.mul(item.quantity));
      }

      const dataSale = {
        clientName: createSaleDTO.clientName,
        clientEmail: createSaleDTO.clientEmail || null,
        phoneNumber: createSaleDTO.phoneNumber || null,
        address: createSaleDTO.address || null,
        status: createSaleDTO.status,
        saleItems: null,
        totalPrice: totalPrice.toString(),
        employee: doesEmployeeReallyExists,
      };

      const saleCreate = queryRunner.manager.create(Sale, dataSale);

      const newSale = await queryRunner.manager.save(Sale, saleCreate);

      const outflows: Outflow[] = [];

      for (const item of createSaleDTO.saleItems) {
        const product = productsMap.get(item.product);

        const differenceBetween = product.unities - item.quantity;

        if (differenceBetween < 0) {
          // Mandar email avisando da quantidade
          throw new BadRequestException(
            `Produto ${product.name} com estoque insuficiente`,
          );
        }

        if (differenceBetween > 0 && differenceBetween <= product.lowStock) {
          // Enviar email avisando da quantidade
        }

        const productUpdate = await queryRunner.manager.update(
          Product,
          product.id,
          {
            unities: differenceBetween,
          },
        );

        if (!productUpdate || productUpdate.affected === 0) {
          throw new InternalServerErrorException(
            `Erro ao atualizar unidades produto ${product.name}`,
          );
        }

        const saleItemsData = {
          quantity: item.quantity,
          priceAtSale: product.price,
          product,
          sale: newSale,
        };

        const saleItemCreate = queryRunner.manager.create(
          SaleItems,
          saleItemsData,
        );

        const newSaleItem = await queryRunner.manager.save(
          SaleItems,
          saleItemCreate,
        );

        const outflowData = {
          name: product.name,
          category: product.category,
          reason: OutflowReason.SALE,
          unities: item.quantity,
          employee: doesEmployeeReallyExists,
          targetType: OutflowType.PRODUCT,
          product,
          saleItem: newSaleItem,
        };

        const outflowCreate = queryRunner.manager.create(Outflow, outflowData);

        outflows.push(outflowCreate);
      }

      await queryRunner.manager.save(Outflow, outflows);

      await queryRunner.commitTransaction();

      const recoverNewSaleDate = await this.salesRepository.findOne({
        where: {
          id: newSale.id,
        },
        relations: {
          employee: true,
          saleItems: true,
        },
        select: {
          employee: {
            id: true,
            email: true,
          },
        },
      });

      const createdAt = Formatter(recoverNewSaleDate.createdAt);

      return {
        ...recoverNewSaleDate,
        createdAt,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      this.logger.error(`Erro ao criar registro de venda: ${error.message}`);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Falha ao processar transação na criação de registro de venda',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async Update(
    id: string,
    updateSaleDTO: UpdateSaleDTO,
    tokenPayloadDTO: TokenPayloadDTO,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const findEmployee = await queryRunner.manager.findOne(Employee, {
        where: {
          id: tokenPayloadDTO.sub,
        },
        relations: {
          role: {
            permissions: true,
          },
        },
      });

      if (!findEmployee) {
        throw new NotFoundException('Funcionário não encontrado');
      }

      const findSale = await queryRunner.manager.findOne(Sale, {
        where: {
          id,
        },
        relations: {
          saleItems: {
            product: true,
          },
        },
      });

      if (!findSale) {
        throw new NotFoundException('Registro de venda não encontrado');
      }

      if (findSale.status === SaleStatus.CANCELED) {
        const hasAdminPermission = findEmployee.role.permissions.some(
          (p: { resource: Resource; action: Action }) =>
            p.resource === Resource.EMPLOYEES && p.action === Action.UPDATE,
        );

        if (!hasAdminPermission) {
          throw new ForbiddenException(
            'Permissão de admin necessária para atualizar vendas canceladas',
          );
        }

        if (findSale.stockFullyReturned) {
          throw new BadRequestException(
            'A venda já foi cancelada, não é possível atualizar seus dados',
          );
        }
      }

      if (updateSaleDTO.status) {
        const saleUpdateData = {
          status: updateSaleDTO.status,
          reason: updateSaleDTO.reason,
          notes: updateSaleDTO.notes,
          returnToStock: updateSaleDTO.returnToStock,
        };

        await this.StatusUpdate(findSale, saleUpdateData, queryRunner);
      }

      const allowedData = {
        clientName: updateSaleDTO.clientName,
        phoneNumber: updateSaleDTO.phoneNumber,
        address: updateSaleDTO.address,
      };

      await this.UpdateRegularData(findSale, allowedData, queryRunner);

      await queryRunner.commitTransaction();

      const recoverUpdatedSaleData = await this.salesRepository.findOne({
        where: {
          id,
        },
      });

      const updatedAt = Formatter(recoverUpdatedSaleData.updatedAt);

      return {
        ...recoverUpdatedSaleData,
        updatedAt,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      this.logger.error(
        `Erro ao atualizar registro de venda: ${error.message}`,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Falha ao processar transação na atualização de registro de venda',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async UpdateRegularData(
    sale: Sale,
    updateSaleDTO: UpdateSaleDTO,
    queryRunner: QueryRunner,
  ) {
    const saleUpdate = await queryRunner.manager.update(Sale, sale.id, {
      ...updateSaleDTO,
    });

    if (!saleUpdate || saleUpdate.affected === 0) {
      throw new InternalServerErrorException(
        'Erro ao tentar atualizar registro da venda',
      );
    }
  }

  async StatusUpdate(
    sale: Sale,
    saleStatusUpdateDTO: SaleStatusUpdateDTO,
    queryRunner: QueryRunner,
  ) {
    const saleUpdate = await queryRunner.manager.update(Sale, sale.id, {
      status: saleStatusUpdateDTO.status,
      reason: saleStatusUpdateDTO.reason || null,
      notes: saleStatusUpdateDTO.notes || null,
    });

    if (!saleUpdate || saleUpdate.affected === 0) {
      throw new InternalServerErrorException(
        'Erro ao tentar atualizar registro da venda',
      );
    }

    if (
      saleStatusUpdateDTO.status === SaleStatus.CANCELED &&
      saleStatusUpdateDTO.returnToStock === true
    ) {
      await this.StockReturn(sale, queryRunner);
    }
  }

  async StockReturn(sale: Sale, queryRunner: QueryRunner) {
    for (const product of sale.saleItems) {
      const findProduct = await queryRunner.manager.findOne(Product, {
        where: {
          id: product.product.id,
        },
      });

      if (!findProduct) {
        throw new NotFoundException(`Produto ${product.id} não encontrado`);
      }

      const returnedUnities = await queryRunner.manager.increment(
        Product,
        { id: findProduct.id },
        'unities',
        product.quantity,
      );

      if (returnedUnities.affected === 0) {
        throw new InternalServerErrorException(
          `Erro ao devolver unidades do produto ${findProduct.name} ao estoque`,
        );
      }

      const saleUpdate = await queryRunner.manager.update(Sale, sale.id, {
        stockFullyReturned: true,
      });

      if (!saleUpdate || saleUpdate.affected === 0) {
        throw new InternalServerErrorException(
          'Erro ao atualizar dados de retorno de estoque',
        );
      }
    }
  }

  FormatterForSearch(salesFound: Sale[]) {
    return salesFound.map((sale) => ({
      ...sale,
      createdAt: Formatter(sale.createdAt),
      updatedAt: Formatter(sale.updatedAt),
    }));
  }

  async FindByDate(paginationByDate: PaginationByDateDTO) {
    const { limit, offset, value } = paginationByDate;

    const [salesFindByDate, total] = await this.salesRepository.findAndCount({
      take: limit,
      skip: offset,
      order: {
        id: 'desc',
      },
      where: {
        createdAt: Between(
          new Date(`${value}T00:00:00`),
          new Date(`${value}T23:59:59`),
        ),
      },
      relations: {
        employee: true,
        saleItems: true,
      },
      select: {
        employee: {
          id: true,
          email: true,
        },
        saleItems: {
          id: true,
          quantity: true,
          priceAtSale: true,
        },
      },
    });

    if (!salesFindByDate) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por registros de vendas',
      );
    }

    if (salesFindByDate.length < 1) {
      throw new NotFoundException('Vendas não encontradas');
    }

    const formattedCreatedAndUpdatedAt =
      this.FormatterForSearch(salesFindByDate);

    return [total, formattedCreatedAndUpdatedAt];
  }

  async FindByHour(paginationByHour: PaginationByHourDTO) {
    const { limit, offset, value } = paginationByHour;

    const query = this.salesRepository
      .createQueryBuilder('sale')
      .where('EXTRACT(HOUR FROM sale.createdAt) = :hour', { hour: value })
      .leftJoinAndSelect('sale.employee', 'employee')
      .addSelect(['employee.id', 'employee.email'])
      .leftJoinAndSelect('sale.saleItems', 'sale_items')
      .addSelect([
        'sale_items.id',
        'sale_items.quantity',
        'sale_items.price_at_sale',
      ])
      .orderBy('sale.id', 'DESC')
      .take(limit)
      .skip(offset);

    const [salesFindByHour, total] = await query.getManyAndCount();

    if (!salesFindByHour) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por registros de vendas',
      );
    }

    if (salesFindByHour.length < 1) {
      throw new NotFoundException('Vendas não encontradas');
    }

    const formattedCreatedAndUpdatedAt =
      this.FormatterForSearch(salesFindByHour);

    return [total, formattedCreatedAndUpdatedAt];
  }

  async FindByClientName(paginationByClientNameDTO: PaginationByClientNameDTO) {
    const { limit, offset, value } = paginationByClientNameDTO;

    const [saleFindByClientName, total] =
      await this.salesRepository.findAndCount({
        take: limit,
        skip: offset,
        order: {
          id: 'desc',
        },
        where: {
          clientName: Like(`${value}%`),
        },
        relations: {
          employee: true,
          saleItems: true,
        },
        select: {
          employee: {
            id: true,
            email: true,
          },
          saleItems: {
            id: true,
            quantity: true,
            priceAtSale: true,
          },
        },
      });

    if (!saleFindByClientName) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por registros de vendas',
      );
    }

    if (saleFindByClientName.length < 1) {
      throw new NotFoundException('Registros de vendas não encontrados');
    }

    const formattedCreatedAndUpdatedAt =
      this.FormatterForSearch(saleFindByClientName);

    return [total, formattedCreatedAndUpdatedAt];
  }

  async FindByAddress(paginationByAddressDTO: PaginationByAddressDTO) {
    const { limit, offset, value } = paginationByAddressDTO;

    const [saleFindByAddress, total] = await this.salesRepository.findAndCount({
      take: limit,
      skip: offset,
      order: {
        id: 'desc',
      },
      where: {
        address: Like(`${value}%`),
      },
      relations: {
        employee: true,
        saleItems: true,
      },
      select: {
        employee: {
          id: true,
          email: true,
        },
        saleItems: {
          id: true,
          quantity: true,
          priceAtSale: true,
        },
      },
    });

    if (!saleFindByAddress) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por registros de vendas',
      );
    }

    if (saleFindByAddress.length < 1) {
      throw new NotFoundException('Registros de vendas não encontrados');
    }

    const formattedCreatedAndUpdatedAt =
      this.FormatterForSearch(saleFindByAddress);

    return [total, formattedCreatedAndUpdatedAt];
  }

  async FindByEmployee(paginationByEmployeeDTO: PaginationByEmployeeDTO) {
    const { limit, offset, value } = paginationByEmployeeDTO;

    const [salesFindByEmployee, total] =
      await this.salesRepository.findAndCount({
        take: limit,
        skip: offset,
        order: {
          id: 'desc',
        },
        where: {
          employee: {
            id: value,
          },
        },
        relations: {
          employee: true,
          saleItems: true,
        },
        select: {
          employee: {
            id: true,
            email: true,
          },
          saleItems: {
            id: true,
            quantity: true,
            priceAtSale: true,
          },
        },
      });

    if (!salesFindByEmployee) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por registros de vendas',
      );
    }

    if (salesFindByEmployee.length < 1) {
      throw new NotFoundException('Registros de vendas não encontrados');
    }

    const formattedCreatedAndUpdatedAt =
      this.FormatterForSearch(salesFindByEmployee);

    return [total, formattedCreatedAndUpdatedAt];
  }
}
