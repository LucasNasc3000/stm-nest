import {
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
import { EmployeeService } from 'src/employee/employee.service';
import { Employee } from 'src/employee/entities/employee.entity';
import { DataSource, Like, QueryRunner, Repository } from 'typeorm';
import { CreateSupplyDTO } from './dto/create-supply.dto';
import { PaginationByCategoryDTO } from './dto/pagination-category.dto';
import { PaginationByDateDTO } from './dto/pagination-date.dto';
import { PaginationByEmployeeDTO } from './dto/pagination-employee.dto';
import { PaginationByExpDateDTO } from './dto/pagination-exp-date.dto';
import { PaginationByNameDTO } from './dto/pagination-name.dto';
import { PaginationByPriceDTO } from './dto/pagination-price.dto';
import { PaginationBySupplierDTO } from './dto/pagination-supplier.dto';
import { SearchByWeightPerUnitDTO } from './dto/pagination-weightperunit.dto';
import { UpdatePriceSupplyRealtimeDTO } from './dto/update-price-supply-realtime.dto';
import { UpdateSupplyRealtimeDTO } from './dto/update-supply-realtime.dto';
import { SupplyHistory } from './entities/supply-history.entity';
import { SupplyRealTime } from './entities/supply-realtime.entity';

@Injectable()
export class SupplyService {
  constructor(
    @InjectRepository(SupplyRealTime)
    private readonly supplyRealTimeRepository: Repository<SupplyRealTime>,

    @InjectRepository(SupplyHistory)
    private readonly supplyHistoryRepository: Repository<SupplyHistory>,
    private readonly employeesService: EmployeeService,
    private dataSource: DataSource,
    private readonly logger: Logger,
  ) {}

  async Create(
    createSupplyDTO: CreateSupplyDTO,
    tokenPayloadDTO: TokenPayloadDTO,
  ) {
    const findEmployee = await this.employeesService.FindById(
      tokenPayloadDTO.sub,
    );

    if (!findEmployee) {
      throw new UnauthorizedException('Funcionário não encontrado');
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

      const data = {
        category: createSupplyDTO.category,
        name: createSupplyDTO.name,
        quantity: createSupplyDTO.quantity,
        totalWeight: createSupplyDTO.totalWeight,
        weightPerUnit: createSupplyDTO.weightPerUnit,
        supplier: createSupplyDTO.supplier,
        expirationDate: createSupplyDTO.expirationDate,
        employee: doesEmployeeReallyExists,
        lowStock: createSupplyDTO.lowStock,
        price: createSupplyDTO.price,
      };

      const doesSupplyAlreadyExists = await queryRunner.manager.findOne(
        SupplyRealTime,
        {
          where: {
            name: createSupplyDTO.name,
            is_active: true,
          },
          lock: { mode: 'pessimistic_write' },
        },
      );

      if (doesSupplyAlreadyExists) {
        const weightPerUnitDecimal = new Decimal(
          doesSupplyAlreadyExists.weightPerUnit,
        );

        const totalWeightDecimal = new Decimal(
          doesSupplyAlreadyExists.totalWeight,
        );

        const addToTotalWeight = weightPerUnitDecimal.mul(
          createSupplyDTO.quantity,
        );

        const newTotalWeight = totalWeightDecimal
          .add(addToTotalWeight)
          .toString();

        const updatedQuantity =
          doesSupplyAlreadyExists.quantity - createSupplyDTO.quantity;

        const supplyUpdate = await queryRunner.manager.update(
          SupplyRealTime,
          doesSupplyAlreadyExists.id,
          {
            totalWeight: newTotalWeight,
            quantity: updatedQuantity,
          },
        );

        const supplyHistoryData = {
          ...data,
          reason: createSupplyDTO.reason,
          totalWeightPerRegister: createSupplyDTO.totalWeightPerRegister,
        };

        await this.SaveSupplyHistory(supplyHistoryData, queryRunner);

        if (!supplyUpdate || supplyUpdate.affected < 1) {
          throw new InternalServerErrorException(
            'Erro ao atualizar insumo existente',
          );
        }

        await queryRunner.commitTransaction();

        return {
          message: 'Insumo já existente atualizado',
          supplyRealTime: supplyUpdate,
        };
      }

      const supplyRealTimeCreate = queryRunner.manager.create(
        SupplyRealTime,
        data,
      );

      const newSupplyRealTime = await queryRunner.manager.save(
        SupplyRealTime,
        supplyRealTimeCreate,
      );

      const supplyHistoryData = {
        ...data,
        reason: createSupplyDTO.reason,
        totalWeightPerRegister: createSupplyDTO.totalWeightPerRegister,
      };

      const newSupplyHistory = await this.SaveSupplyHistory(
        supplyHistoryData,
        queryRunner,
      );

      await queryRunner.commitTransaction();

      return {
        supplyRealTime: newSupplyRealTime,
        supplyHistory: newSupplyHistory,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      this.logger.error(`Erro ao criar insumo: ${error.message}`);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Falha ao processar transação na criação de insumo',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async SaveSupplyHistory(
    createSupplyHistoryDTO: CreateSupplyDTO,
    queryRunnerSub: QueryRunner,
  ) {
    const supplyHistoryCreate = queryRunnerSub.manager.create(
      SupplyHistory,
      createSupplyHistoryDTO,
    );

    await queryRunnerSub.manager.save(supplyHistoryCreate);
  }

  async Update(
    supplyId: UrlUuidDTO,
    updateSupplyRealtimeDTO: UpdateSupplyRealtimeDTO,
  ) {
    const findSupply = await this.supplyRealTimeRepository.findOne({
      where: {
        id: supplyId.id,
        is_active: true,
      },
    });

    if (!findSupply) {
      throw new NotFoundException('Insumo não encontrado');
    }

    const allowedData = {
      category: updateSupplyRealtimeDTO.category,
      name: updateSupplyRealtimeDTO.name,
      supplier: updateSupplyRealtimeDTO.supplier,
      expirationDate: updateSupplyRealtimeDTO.expirationDate,
      lowStock: updateSupplyRealtimeDTO.lowStock,
    };

    const supplyUpdate = await this.supplyRealTimeRepository.preload({
      id: supplyId.id,
      ...allowedData,
    });

    const supplyUpdated =
      await this.supplyRealTimeRepository.save(supplyUpdate);

    if (!supplyUpdate || !supplyUpdated) {
      throw new InternalServerErrorException(
        `Erro ao tentar atualizar insumo: ${findSupply.name}`,
      );
    }

    return supplyUpdated;
  }

  async UpdatePrice(
    supplyId: UrlUuidDTO,
    updatePriceSupplyRealtimeDTO: UpdatePriceSupplyRealtimeDTO,
  ) {
    const findSupply = await this.supplyRealTimeRepository.findOne({
      where: {
        id: supplyId.id,
        is_active: true,
      },
    });

    if (!findSupply) {
      throw new NotFoundException('Insumo não encontrado');
    }

    const supplyUpdate = await this.supplyRealTimeRepository.preload({
      id: supplyId.id,
      price: updatePriceSupplyRealtimeDTO.price,
    });

    const supplyUpdated =
      await this.supplyRealTimeRepository.save(supplyUpdate);

    if (!supplyUpdate || !supplyUpdated) {
      throw new InternalServerErrorException(
        `Erro ao tentar atualizar preço do insumo: ${findSupply.name}`,
      );
    }

    return supplyUpdated;
  }

  async FindById(id: UrlUuidDTO) {
    const supplyRealTimeFindById = await this.supplyRealTimeRepository.findOne({
      where: {
        id: id.id,
        is_active: true,
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

    if (!supplyRealTimeFindById) {
      throw new NotFoundException('Insumo não encontrado');
    }

    return supplyRealTimeFindById;
  }

  async FindBySupplier(paginationBySupplierDTO: PaginationBySupplierDTO) {
    const { limit, offset, value } = paginationBySupplierDTO;

    const [supplyFindBySupplier, total] =
      await this.supplyRealTimeRepository.findAndCount({
        take: limit,
        skip: offset,
        order: {
          id: 'desc',
        },
        where: {
          supplier: Like(`${value}%`),
          is_active: true,
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

    if (!supplyFindBySupplier) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por insumos',
      );
    }

    if (supplyFindBySupplier.length < 1) {
      throw new NotFoundException('Insumos não encontrados');
    }

    return [total, ...supplyFindBySupplier];
  }

  async FindByName(paginationByNameDTO: PaginationByNameDTO) {
    const { limit, offset, value } = paginationByNameDTO;

    const [supplyFindByName, total] =
      await this.supplyRealTimeRepository.findAndCount({
        take: limit,
        skip: offset,
        order: {
          id: 'desc',
        },
        where: {
          name: Like(`${value}%`),
          is_active: true,
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

    if (!supplyFindByName) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por insumos',
      );
    }

    if (supplyFindByName.length < 1) {
      throw new NotFoundException('Insumos não encontrados');
    }

    return [total, ...supplyFindByName];
  }

  async FindByCategory(paginationByCategoryDTO: PaginationByCategoryDTO) {
    const { limit, offset, value } = paginationByCategoryDTO;

    const [supplyFindByCategory, total] =
      await this.supplyRealTimeRepository.findAndCount({
        take: limit,
        skip: offset,
        order: {
          id: 'desc',
        },
        where: {
          category: Like(`${value}%`),
          is_active: true,
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

    if (!supplyFindByCategory) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por insumos',
      );
    }

    if (supplyFindByCategory.length < 1) {
      throw new NotFoundException('Insumos não encontrados');
    }

    return [total, ...supplyFindByCategory];
  }

  async FindByPrice(paginationByPriceDTO: PaginationByPriceDTO) {
    const { limit, offset, value } = paginationByPriceDTO;

    const [supplyFindByPrice, total] =
      await this.supplyRealTimeRepository.findAndCount({
        take: limit,
        skip: offset,
        order: {
          id: 'desc',
        },
        where: {
          price: value,
          is_active: true,
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

    if (!supplyFindByPrice) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por insumos',
      );
    }

    if (supplyFindByPrice.length < 1) {
      throw new NotFoundException('Insumos não encontrados');
    }

    return [total, ...supplyFindByPrice];
  }

  async FindByWeightPerUnit(weightPerUnit: SearchByWeightPerUnitDTO) {
    const supplyRealTimeFindByWeighPerUnit =
      await this.supplyRealTimeRepository.findOne({
        where: {
          weightPerUnit: weightPerUnit.weightPerUnit,
          is_active: true,
        },
        order: {
          id: 'desc',
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

    if (!supplyRealTimeFindByWeighPerUnit) {
      throw new NotFoundException('Insumo não encontrado');
    }

    return supplyRealTimeFindByWeighPerUnit;
  }

  async FindByEmployee(paginationByEmployeeDTO: PaginationByEmployeeDTO) {
    const { limit, offset, value } = paginationByEmployeeDTO;

    const [supplyRealTimeFindByEmployee, total] =
      await this.supplyRealTimeRepository.findAndCount({
        take: limit,
        skip: offset,
        order: {
          id: 'desc',
        },
        where: {
          employee: {
            id: value,
          },
          is_active: true,
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

    if (!supplyRealTimeFindByEmployee) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por insumos',
      );
    }

    if (supplyRealTimeFindByEmployee.length < 1) {
      throw new NotFoundException('Insumos não encontrados');
    }

    return [total, ...supplyRealTimeFindByEmployee];
  }

  async FindByExpirationDate(paginatioByExpDateDTO: PaginationByExpDateDTO) {
    const { limit, offset, value } = paginatioByExpDateDTO;

    const supplyFindByExpDate =
      await this.supplyRealTimeRepository.findAndCount({
        take: limit,
        skip: offset,
        order: {
          id: 'desc',
        },
        where: {
          expirationDate: value,
          is_active: true,
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

    if (!supplyFindByExpDate) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por insumos',
      );
    }

    if (supplyFindByExpDate.length < 1) {
      throw new NotFoundException('Insumos não encontrados');
    }

    return supplyFindByExpDate;
  }

  async FindByDate(paginatioByDateDTO: PaginationByDateDTO) {
    const { limit, offset, value } = paginatioByDateDTO;

    const supplyFindByExpDate = await this.supplyHistoryRepository.findAndCount(
      {
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
      },
    );

    if (!supplyFindByExpDate) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por insumos',
      );
    }

    if (supplyFindByExpDate.length < 1) {
      throw new NotFoundException('Insumos não encontrados');
    }

    return supplyFindByExpDate;
  }
}
