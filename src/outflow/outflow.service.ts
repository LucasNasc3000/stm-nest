import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Decimal from 'decimal.js';
import { TokenPayloadDTO } from 'src/auth/dto/token-payload.dto';
import { GeneralErrorType } from 'src/common/enums/general-error-type.enum';
import { OutflowType } from 'src/common/enums/outflow-type.enum';
import { Employee } from 'src/employee/entities/employee.entity';
import { Product } from 'src/product/entities/product.entity';
import { SupplyRealTime } from 'src/supply/entities/supply-realtime.entity';
import { ErrorManagement } from 'src/utils/error.util';
import { Formatter } from 'src/utils/format-timezone';
import { Between, DataSource, ILike, Repository } from 'typeorm';
import { CreateOutflowDTO } from './dto/create-outflow.dto';
import { OutflowResponse } from './dto/outflow-response.dto';
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
    private dataSource: DataSource,
    private readonly logger: Logger,
  ) {}

  async CreateForProduct(
    createOutflowDTO: CreateOutflowDTO,
    tokenPayloadDTO: TokenPayloadDTO,
  ) {
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
          relations: {
            boss: true,
          },
          select: {
            boss: {
              id: true,
              email: true,
            },
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
            admin: {
              id: tokenPayloadDTO.adminId,
            },
          },
          lock: { mode: 'pessimistic_write' },
        },
      );

      if (!doesProductReallyExists) {
        throw new NotFoundException(
          `Produto ${createOutflowDTO.name} não encontrado`,
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
          // Email de "Stock-out"
        }

        if (
          differenceBetween > 0 &&
          differenceBetween <= doesProductReallyExists.lowStock
        ) {
          // Email de "Low-stock" e quantidade restante
        }
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

      const admin =
        doesEmployeeReallyExists.boss === null
          ? doesEmployeeReallyExists
          : doesEmployeeReallyExists.boss;

      const data = {
        targetType: createOutflowDTO.targetType,
        name: createOutflowDTO.name,
        category: createOutflowDTO.category,
        reason: createOutflowDTO.reason,
        notes: createOutflowDTO.notes || null,
        unities: createOutflowDTO.unities,
        employee: doesEmployeeReallyExists,
        admin,
        product: doesProductReallyExists,
      };

      const outflowCreate = queryRunner.manager.create(Outflow, data);

      const newOutflow = await queryRunner.manager.save(Outflow, outflowCreate);

      await queryRunner.commitTransaction();

      const createdAt = Formatter(newOutflow.createdAt);

      return {
        ...newOutflow,
        createdAt,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      ErrorManagement(error, GeneralErrorType.INTERNAL, {
        logger: `Erro ao criar saída do produto ${createOutflowDTO.name}`,
        queryFailedError: 'Erro ao cadastrar saída do produto',
        internalServerError: 'Erro interno ao criar saída de produto',
        generalError: 'Falha ao processar transação na criação de saída',
      });
    } finally {
      await queryRunner.release();
    }
  }

  async CreateForSupply(
    createOutflowDTO: CreateOutflowDTO,
    tokenPayloadDTO: TokenPayloadDTO,
  ) {
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
          relations: {
            boss: true,
          },
          select: {
            boss: {
              id: true,
              email: true,
            },
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
            admin: {
              id: tokenPayloadDTO.adminId,
            },
          },
          lock: { mode: 'pessimistic_write' },
        },
      );

      if (!doesSupplyReallyExists) {
        throw new NotFoundException(
          `Insumo ${createOutflowDTO.name} não encontrado`,
        );
      }

      const quantityCheck = this.QuantityCheck(
        doesSupplyReallyExists,
        createOutflowDTO,
      );

      const updateSupply = await queryRunner.manager.update(
        SupplyRealTime,
        doesSupplyReallyExists.id,
        {
          quantity: quantityCheck.updatedQuantity,
          totalWeight: quantityCheck.updatedTotalWeight,
        },
      );

      if (!updateSupply || updateSupply.affected < 1) {
        throw new InternalServerErrorException(
          `Erro ao cadastrar saída do insumo ${createOutflowDTO.name}`,
        );
      }

      const admin =
        doesEmployeeReallyExists.boss === null
          ? doesEmployeeReallyExists
          : doesEmployeeReallyExists.boss;

      const data = {
        targetType: createOutflowDTO.targetType,
        name: createOutflowDTO.name,
        category: createOutflowDTO.category,
        reason: createOutflowDTO.reason,
        notes: createOutflowDTO.notes || null,
        quantity: createOutflowDTO.quantity,
        employee: doesEmployeeReallyExists,
        admin,
        supplyRealTime: doesSupplyReallyExists,
      };

      const outflowCreate = queryRunner.manager.create(Outflow, data);

      const newOutflow = await queryRunner.manager.save(Outflow, outflowCreate);

      await queryRunner.commitTransaction();

      const createdAt = Formatter(newOutflow.createdAt);

      return {
        ...newOutflow,
        createdAt,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      ErrorManagement(error, GeneralErrorType.INTERNAL, {
        logger: `Erro ao criar saída do insumo ${createOutflowDTO.name}`,
        queryFailedError: 'Erro ao cadastrar saída do insumo',
        internalServerError: 'Erro interno ao criar saída de insumo',
        generalError: 'Falha ao processar transação na criação de saída',
      });
    } finally {
      await queryRunner.release();
    }
  }

  QuantityCheck(supply: SupplyRealTime, outflow: CreateOutflowDTO) {
    const { quantity } = outflow;

    const { weightPerUnit } = supply;

    const totalWeightDecimal = new Decimal(supply.totalWeight);

    let updatedTotalWeight: Decimal;

    if (outflow.isUnitForSupply === true) {
      const decimalWeightPerUnit = new Decimal(weightPerUnit);

      const toSupplyDefaultUnit = decimalWeightPerUnit.mul(quantity);

      updatedTotalWeight = totalWeightDecimal.sub(toSupplyDefaultUnit);
    } else {
      updatedTotalWeight = totalWeightDecimal.sub(quantity);
    }

    if (updatedTotalWeight.lessThan(0)) {
      throw new BadRequestException(
        `Estoque insuficiente para ${outflow.name}`,
      );
    }

    const updatedQuantity = Math.ceil(
      updatedTotalWeight.div(weightPerUnit).toNumber(),
    );

    if (updatedQuantity === 0) {
      // Email de "Stock-out"
    }

    if (updatedQuantity > 0 && updatedQuantity <= supply.lowStock) {
      // Email de "Low-stock"
    }

    return {
      updatedTotalWeight: updatedTotalWeight.toString(),
      updatedQuantity,
    };
  }

  FormatterForSearch(outflowsFound: Outflow[]) {
    return outflowsFound.map((outflow) => ({
      ...outflow,
      createdAt: Formatter(outflow.createdAt),
      updatedAt: Formatter(outflow.updatedAt),
    }));
  }

  async FindByType(
    tokenPayloadDTO: TokenPayloadDTO,
    paginationByType: PaginationByTypeDTO,
  ) {
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
          admin: {
            id: tokenPayloadDTO.adminId,
          },
        },
        relations: {
          employee: true,
          product: true,
        },
        select: {
          employee: {
            id: true,
            email: true,
          },
          product: {
            id: true,
            name: true,
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

    const formattedCreatedAndUpdatedAt =
      this.FormatterForSearch(outflowFindByType);

    return [total, formattedCreatedAndUpdatedAt];
  }

  async FindByDate(
    tokenPayloadDTO: TokenPayloadDTO,
    paginationByDate: PaginationByDateDTO,
  ) {
    const { limit, offset, value } = paginationByDate;

    const [outflowFindByDate, total] =
      await this.outflowRepository.findAndCount({
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
          admin: {
            id: tokenPayloadDTO.adminId,
          },
        },
        relations: {
          employee: true,
          product: true,
        },
        select: {
          employee: {
            id: true,
            email: true,
          },
          product: {
            id: true,
            name: true,
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

    const formattedCreatedAndUpdatedAt =
      this.FormatterForSearch(outflowFindByDate);

    return [total, formattedCreatedAndUpdatedAt];
  }

  async FindByHour(
    tokenPayloadDTO: TokenPayloadDTO,
    paginationByHour: PaginationByHourDTO,
  ) {
    const { limit, offset, value } = paginationByHour;
    const [hour, minute, second] = value.split(':').map(Number);

    const tz = `AT TIME ZONE 'America/Sao_Paulo'`;

    const query = this.outflowRepository
      .createQueryBuilder('outflow')
      .leftJoinAndSelect('outflow.employee', 'employee')
      .addSelect(['employee.id', 'employee.email'])
      .leftJoinAndSelect('outflow.product', 'product')
      .addSelect(['product.id', 'product.name'])
      .where('outflow.admin.id = :adminId', {
        adminId: tokenPayloadDTO.adminId,
      })
      .orderBy('outflow.id', 'DESC')
      .take(limit)
      .skip(offset);

    switch (true) {
      case minute === undefined || isNaN(minute):
        query.andWhere(`EXTRACT(HOUR FROM outflow.createdAt ${tz}) = :hour`, {
          hour,
        });
        break;

      case !isNaN(minute) && (isNaN(second) || second === undefined):
        query.andWhere(
          `EXTRACT(MINUTE FROM outflow.createdAt ${tz}) = :minute`,
          {
            minute,
          },
        );
        break;

      case !isNaN(minute) && (isNaN(second) || second === undefined):
        query
          .andWhere(`EXTRACT(HOUR FROM outflow.createdAt ${tz}) = :hour`, {
            hour,
          })
          .andWhere(`EXTRACT(MINUTE FROM outflow.createdAt ${tz}) = :minute`, {
            minute,
          });
        break;

      case !isNaN(minute) && !isNaN(second):
        query
          .andWhere(`EXTRACT(HOUR FROM outflow.createdAt ${tz}) = :hour`, {
            hour,
          })
          .andWhere(`EXTRACT(MINUTE FROM outflow.createdAt ${tz}) = :minute`, {
            minute,
          })
          .andWhere(`EXTRACT(SECOND FROM outflow.createdAt ${tz}) = :second`, {
            second,
          });
    }

    const [outflowFindByHour, total] = await query.getManyAndCount();

    if (!outflowFindByHour) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por saídas',
      );
    }

    if (outflowFindByHour.length < 1) {
      throw new NotFoundException('Saídas não encontradas');
    }

    const formattedCreatedAndUpdatedAt =
      this.FormatterForSearch(outflowFindByHour);

    return [total, formattedCreatedAndUpdatedAt];
  }

  async FindByName(
    tokenPayloadDTO: TokenPayloadDTO,
    paginationByName: PaginationByNameDTO,
  ) {
    const { limit, offset, value } = paginationByName;

    const [outflowFindByName, total] =
      await this.outflowRepository.findAndCount({
        take: limit,
        skip: offset,
        order: {
          id: 'desc',
        },
        where: {
          name: ILike(`${value}%`),
          admin: {
            id: tokenPayloadDTO.adminId,
          },
        },
        relations: {
          employee: true,
          product: true,
        },
        select: {
          employee: {
            id: true,
            email: true,
          },
          product: {
            id: true,
            name: true,
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

    const formattedCreatedAndUpdatedAt =
      this.FormatterForSearch(outflowFindByName);

    return [total, formattedCreatedAndUpdatedAt];
  }

  async FindByCategory(
    tokenPayloadDTO: TokenPayloadDTO,
    paginationByCategory: PaginationByCategoryDTO,
  ) {
    const { limit, offset, value } = paginationByCategory;

    const [outflowFindByCategory, total] =
      await this.outflowRepository.findAndCount({
        take: limit,
        skip: offset,
        order: {
          id: 'desc',
        },
        where: {
          category: ILike(`${value}%`),
          admin: {
            id: tokenPayloadDTO.adminId,
          },
        },
        relations: {
          employee: true,
          product: true,
        },
        select: {
          employee: {
            id: true,
            email: true,
          },
          product: {
            id: true,
            name: true,
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

    const formattedCreatedAndUpdatedAt = this.FormatterForSearch(
      outflowFindByCategory,
    );

    return [total, formattedCreatedAndUpdatedAt];
  }

  async FindByReason(
    tokenPayloadDTO: TokenPayloadDTO,
    paginationByReason: PaginationByReasonDTO,
  ) {
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
          admin: {
            id: tokenPayloadDTO.adminId,
          },
        },
        relations: {
          employee: true,
          product: true,
        },
        select: {
          employee: {
            id: true,
            email: true,
          },
          product: {
            id: true,
            name: true,
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

    const formattedCreatedAndUpdatedAt =
      this.FormatterForSearch(outflowFindByReason);

    return [total, formattedCreatedAndUpdatedAt];
  }

  async FindByEmployee(
    tokenPayloadDTO: TokenPayloadDTO,
    paginationByEmployeeDTO: PaginationByEmployeeDTO,
  ): Promise<[number, OutflowResponse[]]> {
    const { limit, offset, value, forDisplay } = paginationByEmployeeDTO;

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
          admin: {
            id: tokenPayloadDTO.adminId,
          },
        },
        relations: {
          employee: true,
          product: true,
        },
        select: {
          employee: {
            id: true,
            email: true,
          },
          product: {
            id: true,
            name: true,
          },
        },
      });

    if (!outflowFindByEmployee) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por saídas',
      );
    }

    if (outflowFindByEmployee.length < 1 && !forDisplay) {
      throw new NotFoundException('Saídas não encontradas');
    }

    const formattedCreatedAndUpdatedAt = this.FormatterForSearch(
      outflowFindByEmployee,
    );

    return [total, formattedCreatedAndUpdatedAt];
  }
}
