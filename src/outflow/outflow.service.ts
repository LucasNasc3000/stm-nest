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
import { UrlUuidDTO } from 'src/common/dto/url-uuid.dto';
import { OutflowType } from 'src/common/enums/outflow-type.enum';
import { EmployeeService } from 'src/employee/employee.service';
import { Employee } from 'src/employee/entities/employee.entity';
import { Product } from 'src/product/entities/product.entity';
import { SupplyHistory } from 'src/supply/entities/supply-history.entity';
import { SupplyRealTime } from 'src/supply/entities/supply-realtime.entity';
import { ReturnDateAndTimeForeignFormat } from 'src/utils/get-date-and-time';
import { DataSource, Repository } from 'typeorm';
import { CreateOutflowDTO } from './dto/create-outflow.dto';
import { PaginationByCategoryDTO } from './dto/pagination-category.dto';
import { PaginationByDateDTO } from './dto/pagination-date.dto';
import { PaginationByEmployeeDTO } from './dto/pagination-employee.dto';
import { PaginationByHourDTO } from './dto/pagination-hour.dto';
import { PaginationByNameDTO } from './dto/pagination-name.dto';
import { PaginationByReasonDTO } from './dto/pagination-reason.dto';
import { PaginationByTypeDTO } from './dto/pagination-type.dto';
import { Outflow } from './entities/outflow.entity';

@Injectable()
export class OutflowService {
  constructor(
    @InjectRepository(Outflow)
    private readonly outflowRepository: Repository<Outflow>,

    @InjectRepository(SupplyHistory)
    private readonly supplyHistoryRepository: Repository<SupplyHistory>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    private readonly employeesService: EmployeeService,
    private dataSource: DataSource,
    private readonly logger: Logger,
  ) {}

  async CreateForProduct(
    createOutflowDTO: CreateOutflowDTO,
    tokenPayloadDTO: TokenPayloadDTO,
  ) {
    const findEmployee = await this.employeesService.FindById(
      tokenPayloadDTO.sub,
    );

    if (!findEmployee) {
      throw new UnauthorizedException('Funcionário não encontrado');
    }

    const productExists = await this.productRepository.findOne({
      where: {
        name: createOutflowDTO.name,
      },
    });

    if (!productExists) {
      throw new NotFoundException(
        `Ocorreu um erro interno ou o insumo ${createOutflowDTO.name} não está cadastrado`,
      );
    }

    if (createOutflowDTO.targetType !== OutflowType.PRODUCT) {
      throw new BadRequestException('O tipo de saída deve ser "PRODUCT"');
    }

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

      const doesProductReallyExists = await queryRunner.manager.findOne(
        Product,
        {
          where: {
            name: createOutflowDTO.name,
            category: createOutflowDTO.category,
          },
          lock: { mode: 'pessimistic_write' },
        },
      );

      if (!doesProductReallyExists) {
        throw new NotFoundException(
          `Ocorreu um erro interno ou o produto ${createOutflowDTO.name} não está cadastrado`,
        );
      }

      const differenceBetween =
        doesProductReallyExists.unities - createOutflowDTO.unities;

      if (differenceBetween < 0) {
        throw new BadRequestException(
          'Quantidade insuficiente do produto em estoque',
        );
      }

      if (
        differenceBetween >= 0 &&
        differenceBetween <= doesProductReallyExists.lowStock
      ) {
        if (differenceBetween === 0) {
          // avisar que acabou
        }

        if (differenceBetween <= doesProductReallyExists.lowStock) {
          // mandar o aviso e a quantidade que sobrou
        }
        // Mandar email avisando da quantidade do produto
      }

      const productUpdate = await queryRunner.manager.update(
        Product,
        doesProductReallyExists.id,
        {
          unities: differenceBetween,
        },
      );

      if (!productUpdate || productUpdate.affected < 1) {
        throw new InternalServerErrorException('Erro ao atualizar produto');
      }

      const dateAndHour = ReturnDateAndTimeForeignFormat();

      const data = {
        targetType: createOutflowDTO.targetType,
        date: dateAndHour[0],
        hour: dateAndHour[1],
        name: createOutflowDTO.name,
        category: createOutflowDTO.category,
        reason: createOutflowDTO.reason,
        unities: createOutflowDTO.unities,
        employee: doesEmployeeReallyExists,
        product: doesProductReallyExists,
      };

      const outflowCreate = queryRunner.manager.create(Outflow, data);

      const newOutflow = await queryRunner.manager.save(Outflow, outflowCreate);

      await queryRunner.commitTransaction();

      return {
        ...newOutflow,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Erro ao criar saída do produto ${createOutflowDTO.name}: ${error.message}`,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Falha ao processar transação na criação de saída',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async CreateForSupply(
    createOutflowDTO: CreateOutflowDTO,
    tokenPayloadDTO: TokenPayloadDTO,
  ) {
    const findEmployee = await this.employeesService.FindById(
      tokenPayloadDTO.sub,
    );

    if (!findEmployee) {
      throw new UnauthorizedException('Funcionário não encontrado');
    }

    const supplyExists = await this.supplyHistoryRepository.findOne({
      where: {
        name: createOutflowDTO.name,
        category: createOutflowDTO.category,
      },
    });

    if (!supplyExists) {
      throw new NotFoundException(
        `Ocorreu um erro interno ou o insumo ${createOutflowDTO.name} não está cadastrado`,
      );
    }

    if (createOutflowDTO.targetType !== OutflowType.SUPPLY) {
      throw new BadRequestException('O tipo de saída deve ser "SUPPLY"');
    }

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

      const doesSupplyReallyExists = await queryRunner.manager.findOne(
        SupplyRealTime,
        {
          where: {
            name: createOutflowDTO.name,
            category: createOutflowDTO.category,
          },
          lock: { mode: 'pessimistic_write' },
        },
      );

      if (!doesSupplyReallyExists) {
        throw new NotFoundException(
          `Ocorreu um erro interno ou o insumo ${createOutflowDTO.name} não está cadastrado`,
        );
      }

      const quantityCheck = this.QuantityCheck(
        doesSupplyReallyExists,
        createOutflowDTO,
      );

      if (quantityCheck === 'Stock_out') {
        throw new BadRequestException(
          `Estoque insuficiente para ${createOutflowDTO.name}`,
        );
      }

      if (quantityCheck === 'Low_stock') {
        // enviar e email e continuar transação
      }

      const totalWeightDecimal = new Decimal(
        doesSupplyReallyExists.totalWeight,
      );

      const updatedTotalWeight = totalWeightDecimal.sub(
        createOutflowDTO.unities,
      );

      if (updatedTotalWeight.lessThan(0)) {
        throw new BadRequestException(
          `Estoque insuficiente para ${createOutflowDTO.name}`,
        );
      }

      const updatedQuantity = Math.ceil(
        updatedTotalWeight.div(doesSupplyReallyExists.weightPerUnit).toNumber(),
      );

      const updateSupply = await queryRunner.manager.update(
        SupplyRealTime,
        doesSupplyReallyExists.id,
        {
          quantity: updatedQuantity,
          totalWeight: updatedTotalWeight.toString(),
        },
      );

      if (!updateSupply || updateSupply.affected < 1) {
        throw new InternalServerErrorException(
          `Erro ao cadastrar saída do insumo ${createOutflowDTO.name}`,
        );
      }

      const dateAndHour = ReturnDateAndTimeForeignFormat();

      const data = {
        targetType: createOutflowDTO.targetType,
        date: dateAndHour[0],
        hour: dateAndHour[1],
        name: createOutflowDTO.name,
        category: createOutflowDTO.category,
        reason: createOutflowDTO.reason,
        unities: createOutflowDTO.unities,
        employee: doesEmployeeReallyExists,
        supplyRealTime: doesSupplyReallyExists,
      };

      const outflowCreate = queryRunner.manager.create(Outflow, data);

      const newOutflow = await queryRunner.manager.save(Outflow, outflowCreate);

      await queryRunner.commitTransaction();

      return {
        ...newOutflow,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Erro ao criar saída do insumo ${createOutflowDTO.name}: ${error.message}`,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Falha ao processar transação na criação de saída',
      );
    } finally {
      await queryRunner.release();
    }
  }

  QuantityCheck(supply: SupplyRealTime, outflow: CreateOutflowDTO) {
    const sub = supply.quantity - outflow.unities;

    if (sub < 1) return 'Stock_out';

    if (sub > 0 && sub <= supply.lowStock) return 'Low_stock';
  }

  async FindById(id: UrlUuidDTO) {
    const outflowFindById = await this.outflowRepository.findOne({
      where: {
        id: id.id,
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

    if (!outflowFindById) {
      throw new NotFoundException('Saída não encontrada');
    }

    return outflowFindById;
  }

  async FindByType(paginationByType: PaginationByTypeDTO) {
    const { limit, offset, value } = paginationByType;

    const [outflowFindByType, total] =
      await this.outflowRepository.findAndCount({
        take: limit,
        skip: offset,
        order: {
          id: 'desc',
        },
        where: {
          targetType: value,
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

    if (!outflowFindByType) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por saídas',
      );
    }

    if (outflowFindByType.length < 1) {
      throw new NotFoundException('Saídas não encontradas');
    }

    return [total, ...outflowFindByType];
  }

  async FindByDate(paginationByDate: PaginationByDateDTO) {
    const { limit, offset, value } = paginationByDate;

    const [outflowFindByDate, total] =
      await this.outflowRepository.findAndCount({
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

    if (!outflowFindByDate) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por saídas',
      );
    }

    if (outflowFindByDate.length < 1) {
      throw new NotFoundException('Saídas não encontradas');
    }

    return [total, ...outflowFindByDate];
  }

  async FindByHour(paginationByHour: PaginationByHourDTO) {
    const { limit, offset, value } = paginationByHour;

    const [outflowFindByHour, total] =
      await this.outflowRepository.findAndCount({
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

    if (!outflowFindByHour) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por saídas',
      );
    }

    if (outflowFindByHour.length < 1) {
      throw new NotFoundException('Saídas não encontradas');
    }

    return [total, ...outflowFindByHour];
  }

  async FindByName(paginationByName: PaginationByNameDTO) {
    const { limit, offset, value } = paginationByName;

    const [outflowFindByName, total] =
      await this.outflowRepository.findAndCount({
        take: limit,
        skip: offset,
        order: {
          id: 'desc',
        },
        where: {
          name: value,
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

    if (!outflowFindByName) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por saídas',
      );
    }

    if (outflowFindByName.length < 1) {
      throw new NotFoundException('Saídas não encontradas');
    }

    return [total, ...outflowFindByName];
  }

  async FindByCategory(paginationByCategory: PaginationByCategoryDTO) {
    const { limit, offset, value } = paginationByCategory;

    const [outflowFindByCategory, total] =
      await this.outflowRepository.findAndCount({
        take: limit,
        skip: offset,
        order: {
          id: 'desc',
        },
        where: {
          category: value,
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

    if (!outflowFindByCategory) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por saídas',
      );
    }

    if (outflowFindByCategory.length < 1) {
      throw new NotFoundException('Saídas não encontradas');
    }

    return [total, ...outflowFindByCategory];
  }

  async FindByReason(paginationByReason: PaginationByReasonDTO) {
    const { limit, offset, value } = paginationByReason;

    const [outflowFindByReason, total] =
      await this.outflowRepository.findAndCount({
        take: limit,
        skip: offset,
        order: {
          id: 'desc',
        },
        where: {
          reason: value,
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

    if (!outflowFindByReason) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por saídas',
      );
    }

    if (outflowFindByReason.length < 1) {
      throw new NotFoundException('Saídas não encontradas');
    }

    return [total, ...outflowFindByReason];
  }

  async FindByEmployee(paginationByEmployeeDTO: PaginationByEmployeeDTO) {
    const { limit, offset, value } = paginationByEmployeeDTO;

    const [outflowFindByEmployee, total] =
      await this.outflowRepository.findAndCount({
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

    if (!outflowFindByEmployee) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por saídas',
      );
    }

    if (outflowFindByEmployee.length < 1) {
      throw new NotFoundException('Saídas não encontradas');
    }

    return [total, ...outflowFindByEmployee];
  }
}
