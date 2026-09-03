import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenPayloadDTO } from 'src/auth/dto/token-payload.dto';
import { SupplySearch } from 'src/common/enums/supply-search.enum';
import { Formatter } from 'src/utils/format-timezone';
import { Repository, SelectQueryBuilder } from 'typeorm';
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
import { SupplyRealTimeResponse } from './dto/supply-realtime-response.dto';
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
    adminId: string,
  ): SelectQueryBuilder<SupplyRealTime | SupplyHistory> {
    let query: SelectQueryBuilder<SupplyHistory | SupplyRealTime>;

    switch (supply) {
      case SupplySearch.SUPPLY_HISTORY:
        query = this.supplyHistoryRepository
          .createQueryBuilder('supply')
          .where('supply.adminId = :adminId', {
            adminId,
          })
          .leftJoinAndSelect('supply.employee', 'employee');
        break;

      case SupplySearch.SUPPLY_REAL_TIME:
        query = this.supplyRealTimeRepository
          .createQueryBuilder('supply')
          .where('supply.is_active = true')
          .andWhere('supply.adminId = :adminId', {
            adminId,
          })
          .leftJoinAndSelect('supply.employee', 'employee');
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

  async FindBySupplier(
    tokenPayloadDTO: TokenPayloadDTO,
    paginationBySupplierDTO: PaginationBySupplierDTO,
  ) {
    const { limit, offset, value, supplyType } = paginationBySupplierDTO;

    const query = this.QueryBuilderGenerator(
      supplyType,
      tokenPayloadDTO.adminId,
    );

    query
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

  async FindByName(
    tokenPayloadDTO: TokenPayloadDTO,
    paginationByNameDTO: PaginationByNameDTO,
  ): Promise<[number, (SupplyHistoryResponse | SupplyRealTimeResponse)[]]> {
    const { limit, offset, value, supplyType, forDisplay } =
      paginationByNameDTO;

    const query = this.QueryBuilderGenerator(
      supplyType,
      tokenPayloadDTO.adminId,
    );

    query
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

    if (supplyFindByName.length < 1 && !forDisplay) {
      throw new NotFoundException('Insumos não encontrados');
    }

    const formattedCreatedAndUpdatedAt =
      this.FormatterForSearch(supplyFindByName);

    return [total, formattedCreatedAndUpdatedAt];
  }

  async FindByCategory(
    tokenPayloadDTO: TokenPayloadDTO,
    paginationByCategoryDTO: PaginationByCategoryDTO,
  ) {
    const { limit, offset, value, supplyType } = paginationByCategoryDTO;

    const query = this.QueryBuilderGenerator(
      supplyType,
      tokenPayloadDTO.adminId,
    );

    query
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

  async FindByPrice(
    tokenPayloadDTO: TokenPayloadDTO,
    paginationByPriceDTO: PaginationByPriceDTO,
  ) {
    const { limit, offset, value, supplyType } = paginationByPriceDTO;

    const query = this.QueryBuilderGenerator(
      supplyType,
      tokenPayloadDTO.adminId,
    );

    query
      .andWhere('supply.price = :price', {
        price: value,
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

  async FindByTotalPrice(
    tokenPayloadDTO: TokenPayloadDTO,
    paginationByPriceDTO: PaginationByPriceDTO,
  ) {
    const { limit, offset, value, supplyType } = paginationByPriceDTO;

    const query = this.QueryBuilderGenerator(
      supplyType,
      tokenPayloadDTO.adminId,
    );

    query
      .andWhere('supply.total_price = :totalPrice', {
        totalPrice: value,
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
    tokenPayloadDTO: TokenPayloadDTO,
    paginationByWeightPerUnitDTO: PaginationByWeightPerUnitDTO,
  ) {
    const { limit, offset, value, supplyType } = paginationByWeightPerUnitDTO;

    const query = this.QueryBuilderGenerator(
      supplyType,
      tokenPayloadDTO.adminId,
    );

    query
      .andWhere('supply.weight_per_unit = :weightPerUnit', {
        weightPerUnit: value,
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

  async FindByExpirationDate(
    tokenPayloadDTO: TokenPayloadDTO,
    paginationByExpDateDTO: PaginationByExpDateDTO,
  ) {
    const { limit, offset, value, supplyType } = paginationByExpDateDTO;

    const query = this.QueryBuilderGenerator(
      supplyType,
      tokenPayloadDTO.adminId,
    );

    query
      .andWhere('supply.expiration_date = :expiration_date', {
        expiration_date: value,
      })
      .orderBy('supply.id', 'DESC')
      .take(limit)
      .skip(offset);

    const [supplyHistoryFindByTotalWeightPerRegister, total] =
      await query.getManyAndCount();

    if (!supplyHistoryFindByTotalWeightPerRegister) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao buscar insumos',
      );
    }

    if (supplyHistoryFindByTotalWeightPerRegister.length < 1) {
      throw new NotFoundException('Insumos não encontrados');
    }

    const formattedCreatedAndUpdatedAt = this.FormatterForSearch(
      supplyHistoryFindByTotalWeightPerRegister,
    );

    return [total, formattedCreatedAndUpdatedAt];
  }

  async FindByEmployee(
    tokenPayloadDTO: TokenPayloadDTO,
    paginationByEmployeeDTO: PaginationByEmployeeDTO,
  ): Promise<[number, (SupplyHistoryResponse | SupplyRealTimeResponse)[]]> {
    const { limit, offset, value, supplyType, forDisplay } =
      paginationByEmployeeDTO;

    const query = this.QueryBuilderGenerator(
      supplyType,
      tokenPayloadDTO.adminId,
    );

    query
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

  async FindByDate(
    tokenPayloadDTO: TokenPayloadDTO,
    paginatioByDateDTO: PaginationByDateDTO,
  ) {
    const { limit, offset, value, supplyType } = paginatioByDateDTO;

    const query = this.QueryBuilderGenerator(
      supplyType,
      tokenPayloadDTO.adminId,
    );

    query
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
          totalWeightPerRegister: value,
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
      throw new InternalServerErrorException(
        'Erro desconhecido ao buscar insumos',
      );
    }

    if (supplyHistoryFindByTotalWeightPerRegister.length < 1) {
      throw new NotFoundException('Insumos não encontrados');
    }

    const formattedCreatedAndUpdatedAt = this.FormatterForSearch(
      supplyHistoryFindByTotalWeightPerRegister,
    );

    return [total, formattedCreatedAndUpdatedAt];
  }
}
