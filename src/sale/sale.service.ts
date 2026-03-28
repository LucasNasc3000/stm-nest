import {
  BadRequestException,
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
import { EmployeeService } from 'src/employee/employee.service';
import { Employee } from 'src/employee/entities/employee.entity';
import { Outflow } from 'src/outflow/entities/outflow.entity';
import { Formatter } from 'src/utils/format-timezone';
import { Between, DataSource, In, Like, Repository } from 'typeorm';
import { Product } from '../product/entities/product.entity';
import { CreateSaleDTO } from './dto/create-sale.dto';
import { PaginationByAddressDTO } from './dto/pagination-address.dto';
import { PaginationByClientNameDTO } from './dto/pagination-client-name.dto';
import { PaginationByDateDTO } from './dto/pagination-date.dto';
import { PaginationByEmployeeDTO } from './dto/pagination-employee.dto';
import { PaginationByHourDTO } from './dto/pagination-hour.dto';
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

  async Update(id: string, updateSaleDTO: UpdateSaleDTO) {
    const findSale = await this.salesRepository.findOne({
      where: {
        id,
      },
    });

    if (!findSale) {
      throw new NotFoundException('Registro de venda não encontrado');
    }

    const allowedData = {
      clientName: updateSaleDTO.clientName,
      phoneNumber: updateSaleDTO.phoneNumber,
      address: updateSaleDTO.address,
      status: updateSaleDTO.status,
      reason: updateSaleDTO.reason,
      notes: updateSaleDTO.notes || null,
    };

    const supplyUpdate = await this.salesRepository.preload({
      id,
      ...allowedData,
    });

    const saleUpdated = await this.salesRepository.save(supplyUpdate);

    if (!supplyUpdate || !saleUpdated) {
      throw new InternalServerErrorException(
        'Erro ao tentar atualizar registro da venda',
      );
    }

    const createdAt = Formatter(saleUpdated.createdAt);
    const updatedAt = Formatter(saleUpdated.updatedAt);

    return {
      ...saleUpdated,
      createdAt,
      updatedAt,
    };
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
