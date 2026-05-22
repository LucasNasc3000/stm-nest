import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SupplySearch } from 'src/common/enums/supply-search.enum';
import { Formatter } from 'src/utils/format-timezone';
import { Raw, Repository, SelectQueryBuilder } from 'typeorm';
import { PaginationByCategoryDTO } from './dto/pagination-category.dto';
import { PaginationByDateDTO } from './dto/pagination-date.dto';
import { PaginationByEmployeeDTO } from './dto/pagination-employee.dto';
import { PaginationByExpDateDTO } from './dto/pagination-exp-date.dto';
import { PaginationByNameDTO } from './dto/pagination-name.dto';
import { PaginationByPriceDTO } from './dto/pagination-price.dto';
import { PaginationByReasonDTO } from './dto/pagination-reason.dto';
import { PaginationBySupplierDTO } from './dto/pagination-supplier.dto';
import { PaginationByTotalWeightDTO } from './dto/pagination-totalweight.dto';
import { PaginationByWeightPerUnitDTO } from './dto/pagination-weightperunit.dto';
import { SupplyHistoryResponse } from './dto/supply-history-response.dto';
import { SupplyRealTimeResponse } from './dto/supply-realtime-response.dto copy';
import { SupplyHistory } from './entities/supply-history.entity';
import { SupplyRealTime } from './entities/supply-realtime.entity';

@Injectable()
export class SupplyFindService {
  constructor(
    @InjectRepository(SupplyRealTime)
    private readonly supplyRealTimeRepository: Repository<SupplyRealTime>,

    @InjectRepository(SupplyHistory)
    private readonly supplyHistoryRepository: Repository<SupplyHistory>,
  ) {}

  QueryBuilderGenerator(
    supply: SupplySearch,
  ): SelectQueryBuilder<SupplyRealTime | SupplyHistory> {
    let query: SelectQueryBuilder<SupplyHistory | SupplyRealTime>;

    switch (supply) {
      case SupplySearch.SUPPLY_HISTORY:
        query = this.supplyHistoryRepository.createQueryBuilder('supply');
        break;

      case SupplySearch.SUPPLY_REAL_TIME:
        query = this.supplyRealTimeRepository
          .createQueryBuilder('supply')
          .where('supply.is_active = true');
        break;

      default:
        throw new InternalServerErrorException(
          'Tipo não definido para query builder',
        );
    }

    return query;
  }

  FormatterForSearch(suppliesFound: (SupplyHistory | SupplyRealTime)[]) {
    return suppliesFound.map((supply) => ({
      ...supply,
      createdAt: Formatter(supply.createdAt),
      updatedAt: Formatter(supply.updatedAt),
    }));
  }

  async FindByIdSupplyRealTime(id: string) {
    const supplyRealTimeFindById = await this.supplyRealTimeRepository.findOne({
      where: {
        id,
        isActive: true,
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

    const createdAt = Formatter(supplyRealTimeFindById.createdAt);
    const updatedAt = Formatter(supplyRealTimeFindById.updatedAt);

    return {
      ...supplyRealTimeFindById,
      createdAt,
      updatedAt,
    };
  }

  async FindByIdSupplyHistory(id: string) {
    const supplyHistoryFindById = await this.supplyHistoryRepository.findOne({
      where: {
        id,
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

    if (!supplyHistoryFindById) {
      throw new NotFoundException('Insumo não encontrado');
    }

    const createdAt = Formatter(supplyHistoryFindById.createdAt);
    const updatedAt = Formatter(supplyHistoryFindById.updatedAt);

    return {
      ...supplyHistoryFindById,
      createdAt,
      updatedAt,
    };
  }

  async FindBySupplier(paginationBySupplierDTO: PaginationBySupplierDTO) {
    const { limit, offset, value, supplyType } = paginationBySupplierDTO;

    const query = this.QueryBuilderGenerator(supplyType);

    query
      .leftJoinAndSelect('supply.employee', 'employee')
      .andWhere('supply.supplier ILIKE :supplier', { supplier: `${value}%` })
      .orderBy('supply.id', 'DESC')
      .take(limit)
      .skip(offset);

    const [supplyFindBySupplier, total] = await query.getManyAndCount();

    if (!supplyFindBySupplier) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por insumos',
      );
    }

    if (supplyFindBySupplier.length < 1) {
      throw new NotFoundException('Insumos não encontrados');
    }

    const formattedCreatedAndUpdatedAt =
      this.FormatterForSearch(supplyFindBySupplier);

    return [total, formattedCreatedAndUpdatedAt];
  }

  async FindByName(paginationByNameDTO: PaginationByNameDTO) {
    const { limit, offset, value, supplyType } = paginationByNameDTO;

    const query = this.QueryBuilderGenerator(supplyType);

    query
      .leftJoinAndSelect('supply.employee', 'employee')
      .andWhere('supply.name ILIKE :name', { name: `${value}%` })
      .orderBy('supply.id', 'DESC')
      .take(limit)
      .skip(offset);

    const [supplyFindByName, total] = await query.getManyAndCount();

    if (!supplyFindByName) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por insumos',
      );
    }

    if (supplyFindByName.length < 1) {
      throw new NotFoundException('Insumos não encontrados');
    }

    const formattedCreatedAndUpdatedAt =
      this.FormatterForSearch(supplyFindByName);

    return [total, formattedCreatedAndUpdatedAt];
  }

  async FindByCategory(paginationByCategoryDTO: PaginationByCategoryDTO) {
    const { limit, offset, value, supplyType } = paginationByCategoryDTO;

    const query = this.QueryBuilderGenerator(supplyType);

    query
      .leftJoinAndSelect('supply.employee', 'employee')
      .andWhere('supply.category ILIKE :category', { category: `${value}%` })
      .orderBy('supply.id', 'DESC')
      .take(limit)
      .skip(offset);

    const [supplyFindByCategory, total] = await query.getManyAndCount();

    if (!supplyFindByCategory) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por insumos',
      );
    }

    if (supplyFindByCategory.length < 1) {
      throw new NotFoundException('Insumos não encontrados');
    }

    const formattedCreatedAndUpdatedAt =
      this.FormatterForSearch(supplyFindByCategory);

    return [total, formattedCreatedAndUpdatedAt];
  }

  async FindByPrice(paginationByPriceDTO: PaginationByPriceDTO) {
    const { limit, offset, value, supplyType } = paginationByPriceDTO;

    const query = this.QueryBuilderGenerator(supplyType);

    query
      .leftJoinAndSelect('supply.employee', 'employee')
      .andWhere('CAST(supply.price AS TEXT) LIKE :price', {
        price: `${value}%`,
      })
      .orderBy('supply.id', 'DESC')
      .take(limit)
      .skip(offset);

    const [supplyFindByPrice, total] = await query.getManyAndCount();

    if (!supplyFindByPrice) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por insumos',
      );
    }

    if (supplyFindByPrice.length < 1) {
      throw new NotFoundException('Insumos não encontrados');
    }

    const formattedCreatedAndUpdatedAt =
      this.FormatterForSearch(supplyFindByPrice);

    return [total, formattedCreatedAndUpdatedAt];
  }

  async FindByTotalPrice(paginationByPriceDTO: PaginationByPriceDTO) {
    const { limit, offset, value, supplyType } = paginationByPriceDTO;

    const query = this.QueryBuilderGenerator(supplyType);

    query
      .leftJoinAndSelect('supply.employee', 'employee')
      .andWhere('CAST(supply.total_price AS TEXT) LIKE :totalPrice', {
        totalPrice: `${value}%`,
      })
      .orderBy('supply.id', 'DESC')
      .take(limit)
      .skip(offset);

    const [supplyFindByPrice, total] = await query.getManyAndCount();

    if (!supplyFindByPrice) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por insumos',
      );
    }

    if (supplyFindByPrice.length < 1) {
      throw new NotFoundException('Insumos não encontrados');
    }

    const formattedCreatedAndUpdatedAt =
      this.FormatterForSearch(supplyFindByPrice);

    return [total, formattedCreatedAndUpdatedAt];
  }

  async FindByWeightPerUnit(
    paginationByWeightPerUnitDTO: PaginationByWeightPerUnitDTO,
  ) {
    const { limit, offset, value, supplyType } = paginationByWeightPerUnitDTO;

    const query = this.QueryBuilderGenerator(supplyType);

    query
      .leftJoinAndSelect('supply.employee', 'employee')
      .andWhere('CAST(supply.weight_per_unit AS TEXT) LIKE :weightPerUnit', {
        weightPerUnit: `${value}%`,
      })
      .orderBy('supply.id', 'DESC')
      .take(limit)
      .skip(offset);

    const [supplyFindByWeightPerUnit, total] = await query.getManyAndCount();

    if (!supplyFindByWeightPerUnit) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por insumos',
      );
    }

    if (supplyFindByWeightPerUnit.length < 1) {
      throw new NotFoundException('Insumos não encontrados');
    }

    const formattedCreatedAndUpdatedAt = this.FormatterForSearch(
      supplyFindByWeightPerUnit,
    );

    return [total, formattedCreatedAndUpdatedAt];
  }

  async FindByEmployee(
    paginationByEmployeeDTO: PaginationByEmployeeDTO,
  ): Promise<[number, (SupplyHistoryResponse | SupplyRealTimeResponse)[]]> {
    const { limit, offset, value, supplyType, forDisplay } =
      paginationByEmployeeDTO;

    const query = this.QueryBuilderGenerator(supplyType);

    query
      .leftJoinAndSelect('supply.employee', 'employee')
      .andWhere('supply.employee = :employee', { employee: value })
      .orderBy('supply.id', 'DESC')
      .take(limit)
      .skip(offset);

    const [supplyFindByEmployee, total] = await query.getManyAndCount();

    if (!supplyFindByEmployee) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por insumos',
      );
    }

    if (supplyFindByEmployee.length < 1 && !forDisplay) {
      throw new NotFoundException('Insumos não encontrados');
    }

    const formattedCreatedAndUpdatedAt =
      this.FormatterForSearch(supplyFindByEmployee);

    return [total, formattedCreatedAndUpdatedAt];
  }

  async FindByExpirationDate(paginatioByExpDateDTO: PaginationByExpDateDTO) {
    const { limit, offset, value, supplyType } = paginatioByExpDateDTO;

    const query = this.QueryBuilderGenerator(supplyType);

    query
      .leftJoinAndSelect('supply.employee', 'employee')
      .andWhere('supply.expiration_date = :expirationDate', {
        expirationDate: value,
      })
      .orderBy('supply.id', 'DESC')
      .take(limit)
      .skip(offset);

    const [supplyFindByExpirationDate, total] = await query.getManyAndCount();

    if (!supplyFindByExpirationDate) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por insumos',
      );
    }

    if (supplyFindByExpirationDate.length < 1) {
      throw new NotFoundException('Insumos não encontrados');
    }

    const formattedCreatedAndUpdatedAt = this.FormatterForSearch(
      supplyFindByExpirationDate,
    );

    return [total, formattedCreatedAndUpdatedAt];
  }

  async FindByDate(paginatioByDateDTO: PaginationByDateDTO) {
    const { limit, offset, value, supplyType } = paginatioByDateDTO;

    const query = this.QueryBuilderGenerator(supplyType);

    query
      .leftJoinAndSelect('supply.employee', 'employee')
      .andWhere('supply.created_at BETWEEN :startDate AND :endDate', {
        startDate: new Date(`${value}T00:00:00`),
        endDate: new Date(`${value}T23:59:59`),
      })
      .orderBy('supply.id', 'DESC')
      .take(limit)
      .skip(offset);

    const [supplyFindByDate, total] = await query.getManyAndCount();

    if (!supplyFindByDate) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por insumos',
      );
    }

    if (supplyFindByDate.length < 1) {
      throw new NotFoundException('Insumos não encontrados');
    }

    const formattedCreatedAndUpdatedAt =
      this.FormatterForSearch(supplyFindByDate);

    return [total, formattedCreatedAndUpdatedAt];
  }

  async FindByReason(paginationByReasonDTO: PaginationByReasonDTO) {
    const { limit, offset, value } = paginationByReasonDTO;

    const [supplyFindByReason, total] =
      await this.supplyHistoryRepository.findAndCount({
        take: limit,
        skip: offset,
        order: {
          id: 'desc',
        },
        where: {
          reason: value,
        },
      });

    if (!supplyFindByReason) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por insumos',
      );
    }

    if (supplyFindByReason.length < 1) {
      throw new NotFoundException('Insumos não encontrados');
    }

    const formattedCreatedAndUpdatedAt =
      this.FormatterForSearch(supplyFindByReason);

    return [total, formattedCreatedAndUpdatedAt];
  }

  async FindByTotalWeightPerRegister(
    paginationByTotalWeightDTO: PaginationByTotalWeightDTO,
  ) {
    const { limit, offset, value } = paginationByTotalWeightDTO;

    const [supplyHistoryFindByTotalWeightPerRegister, total] =
      await this.supplyHistoryRepository.findAndCount({
        take: limit,
        skip: offset,
        order: {
          id: 'desc',
        },
        where: {
          totalWeightPerRegister: Raw(
            (alias) => `CAST(${alias} AS TEXT) LIKE :value`,
            {
              value: `${value}%`,
            },
          ),
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

    if (!supplyHistoryFindByTotalWeightPerRegister) {
      throw new NotFoundException('Insumos não encontrados');
    }

    const formattedCreatedAndUpdatedAt = this.FormatterForSearch(
      supplyHistoryFindByTotalWeightPerRegister,
    );

    return [total, formattedCreatedAndUpdatedAt];
  }
}
