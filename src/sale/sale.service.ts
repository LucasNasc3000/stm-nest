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
import { TokenPayloadDTO } from 'src/auth/dto/token-payload.dto';
import { UrlUuidDTO } from 'src/common/dto/url-uuid.dto';
import { EmployeeService } from 'src/employee/employee.service';
import { Employee } from 'src/employee/entities/employee.entity';
import { DataSource, Like, Repository } from 'typeorm';
import { Product } from '../product/entities/product.entity';
import { CreateSaleDTO } from './dto/create-sale.dto';
import { PaginationByAddressDTO } from './dto/pagination-address.dto';
import { PaginationByClientNameDTO } from './dto/pagination-client-name.dto';
import { PaginationByDateDTO } from './dto/pagination-date.dto';
import { PaginationByEmployeeDTO } from './dto/pagination-employee.dto';
import { PaginationByHourDTO } from './dto/pagination-hour.dto';
import { UpdatePriceSaleDTO } from './dto/update-price-sale.dto';
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
    const findEmployee = await this.employeesService.FindById(
      tokenPayloadDTO.sub,
    );

    if (!findEmployee) {
      throw new UnauthorizedException('Funcionário não encontrado');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const dataSale = {
      date: createSaleDTO.date,
      hour: createSaleDTO.hour,
      clientName: createSaleDTO.clientName,
      phoneNumber: createSaleDTO.phoneNumber,
      address: createSaleDTO.address,
      saleItems: null,
    };

    const dataSaleItems: SaleItems[] = [];

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

      const createSale = queryRunner.manager.create(Sale, dataSale);

      const newSale = await queryRunner.manager.save(Sale, createSale);

      for (const item of createSaleDTO.saleItems) {
        const itemExists = await queryRunner.manager.findOne(Product, {
          where: {
            id: item.product,
          },
        });

        if (!itemExists) {
          throw new NotFoundException(`Produto ${item.product} não encontrado`);
        }

        const differenceBetween = itemExists.unities - item.quantity;

        if (differenceBetween < 1) {
          // Mandar email avisando da quantidade
          throw new BadRequestException(
            `Produto ${item.product} com estoque insuficiente de ${itemExists.unities} unidades`,
          );
        }

        if (differenceBetween > 0 && differenceBetween <= itemExists.lowStock) {
          // Enviar email avisando da quantidade
        }

        const data = {
          quantity: item.quantity,
          price: item.price,
          product: itemExists,
          sale: newSale,
        };

        const createSaleItems = queryRunner.manager.create(SaleItems, data);

        dataSaleItems.push(createSaleItems);
      }

      await queryRunner.manager.save(SaleItems, dataSaleItems);

      await queryRunner.commitTransaction();

      return {
        ...newSale,
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

  async Update(saleId: UrlUuidDTO, updateSaleDTO: UpdateSaleDTO) {
    const findSale = await this.salesRepository.findOne({
      where: {
        id: saleId.id,
      },
    });

    if (!findSale) {
      throw new NotFoundException('Registro de venda não encontrado');
    }

    const allowedData = {
      clientName: updateSaleDTO.clientName,
      phoneNumber: updateSaleDTO.phoneNumber,
      address: updateSaleDTO.address,
    };

    const supplyUpdate = await this.salesRepository.preload({
      id: saleId.id,
      ...allowedData,
    });

    const saleUpdated = await this.salesRepository.save(supplyUpdate);

    if (!supplyUpdate || !saleUpdated) {
      throw new InternalServerErrorException(
        'Erro ao tentar atualizar registro da venda',
      );
    }

    return saleUpdated;
  }

  async UpdatePrice(
    saleId: UrlUuidDTO,
    updatePriceSaleDTO: UpdatePriceSaleDTO,
  ) {
    const findSale = await this.salesRepository.findOne({
      where: {
        id: saleId.id,
      },
    });

    if (!findSale) {
      throw new NotFoundException('Registro de venda não encontrado');
    }

    const supplyUpdate = await this.salesRepository.preload({
      id: saleId.id,
      price: updatePriceSaleDTO.price,
    });

    const saleUpdated = await this.salesRepository.save(supplyUpdate);

    if (!supplyUpdate || !saleUpdated) {
      throw new InternalServerErrorException(
        'Erro ao tentar atualizar preço do registro da venda',
      );
    }

    return saleUpdated;
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
        date: value,
      },
      relations: {
        employee: true,
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

    return [total, ...salesFindByDate];
  }

  async FindByHour(paginationByHour: PaginationByHourDTO) {
    const { limit, offset, value } = paginationByHour;

    const [salesFindByHour, total] = await this.salesRepository.findAndCount({
      take: limit,
      skip: offset,
      order: {
        id: 'desc',
      },
      where: {
        hour: value,
      },
      relations: {
        employee: true,
      },
      select: {
        employee: {
          id: true,
          email: true,
        },
      },
    });

    if (!salesFindByHour) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por registros de vendas',
      );
    }

    if (salesFindByHour.length < 1) {
      throw new NotFoundException('Vendas não encontradas');
    }

    return [total, ...salesFindByHour];
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

    return [total, ...saleFindByClientName];
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
        clientName: Like(`${value}%`),
      },
      relations: {
        employee: true,
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

    return [total, ...saleFindByAddress];
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

    return [total, ...salesFindByEmployee];
  }
}
