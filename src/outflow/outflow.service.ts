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
import { UrlUuidDTO } from 'src/common/dto/url-uuid.dto';
import { EmployeeService } from 'src/employee/employee.service';
import { Employee } from 'src/employee/entities/employee.entity';
import { SupplyHistory } from 'src/supply/entities/supply-history.entity';
import { SupplyRealTime } from 'src/supply/entities/supply-realtime.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateOutflowDTO } from './dto/create-outflow.dto';
import { PaginationByDateDTO } from './dto/pagination-date.dto';
import { PaginationByEmployeeDTO } from './dto/pagination-employee.dto';
import { PaginationByHourDTO } from './dto/pagination-hour.dto';
import { PaginationByReasonDTO } from './dto/pagination-reason.dto';
import { PaginationByUnitiesDTO } from './dto/pagination-unities.dto';
import { Outflow } from './entities/outflow.entity';

@Injectable()
export class OutflowService {
  constructor(
    @InjectRepository(Outflow)
    private readonly outflowRepository: Repository<Outflow>,

    @InjectRepository(SupplyHistory)
    private readonly supplyHistoryRepository: Repository<SupplyHistory>,

    private readonly employeesService: EmployeeService,
    private dataSource: DataSource,
    private readonly logger: Logger,
  ) {}

  async Create(
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

      const quantityUpdate =
        doesSupplyReallyExists.quantity - createOutflowDTO.unities;

      const weighPerUnitDecimal = new Decimal(
        doesSupplyReallyExists.weightPerUnit,
      );

      const totalWeightDecimal = new Decimal(
        doesSupplyReallyExists.totalWeight,
      );

      const outflowTotalWeight = weighPerUnitDecimal.mul(
        createOutflowDTO.unities,
      );

      const updatedTotalWeight = totalWeightDecimal
        .sub(outflowTotalWeight)
        .toString();

      const updateSupply = await queryRunner.manager.update(
        SupplyRealTime,
        doesSupplyReallyExists.id,
        {
          quantity: quantityUpdate,
          totalWeight: updatedTotalWeight,
        },
      );

      if (!updateSupply || updateSupply.affected < 1) {
        throw new InternalServerErrorException(
          `Erro ao cadastrar saída do insumo ${createOutflowDTO.name}`,
        );
      }

      const data = {
        date: createOutflowDTO.date,
        hour: createOutflowDTO.hour,
        name: createOutflowDTO.name,
        category: createOutflowDTO.category,
        reason: createOutflowDTO.reason,
        unities: createOutflowDTO.unities,
        employee: doesEmployeeReallyExists,
        supplyRealTime: doesSupplyReallyExists,
      };

      const outflowCreate = queryRunner.manager.create(Outflow, data);

      const newOutflow = await queryRunner.manager.save(Outflow, outflowCreate);

      if (!outflowCreate || !newOutflow) {
        throw new InternalServerErrorException(
          `Erro ao cadastrar saída de ${createOutflowDTO.name}`,
        );
      }

      return {
        ...newOutflow,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Erro ao criar saída do insumo ${createOutflowDTO.name}: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  QuantityCheck(supply: SupplyRealTime, outflow: CreateOutflowDTO) {
    if (outflow.unities > supply.quantity) return 'Stock_out';

    const sub = supply.quantity - outflow.unities;

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

  async FindByUnities(paginationByUnities: PaginationByUnitiesDTO) {
    const { limit, offset, value } = paginationByUnities;

    const [outflowFindByUnities, total] =
      await this.outflowRepository.findAndCount({
        take: limit,
        skip: offset,
        order: {
          id: 'desc',
        },
        where: {
          unities: +value,
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

    if (!outflowFindByUnities) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por saídas',
      );
    }

    if (outflowFindByUnities.length < 1) {
      throw new NotFoundException('Saídas não encontradas');
    }

    return [total, ...outflowFindByUnities];
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
