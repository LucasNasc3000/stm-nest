import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Raw, Repository } from 'typeorm';
import { PaginationByCategoryDTO } from './dto/pagination-category.dto';
import { PaginationByDateDTO } from './dto/pagination-date.dto';
import { PaginationByEmployeeDTO } from './dto/pagination-employee.dto';
import { PaginationByExpDateDTO } from './dto/pagination-exp-date.dto';
import { PaginationByNameDTO } from './dto/pagination-name.dto';
import { PaginationByPriceDTO } from './dto/pagination-price.dto';
import { PaginationBySupplierDTO } from './dto/pagination-supplier.dto';
import { PaginationByTotalWeightDTO } from './dto/pagination-totalweight.dto';
import { PaginationByWeightPerUnitDTO } from './dto/pagination-weightperunit.dto';
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

  async FindById(id: string) {
    const supplyRealTimeFindById = await this.supplyRealTimeRepository.findOne({
      where: {
        id,
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
          price: Raw((alias) => `CAST(${alias} AS TEXT) LIKE :value`, {
            value: `${value}%`,
          }),
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

  async FindByWeightPerUnit(
    paginationByWeightPerUnitDTO: PaginationByWeightPerUnitDTO,
  ) {
    const { limit, offset, value } = paginationByWeightPerUnitDTO;

    const [supplyRealTimeFindByWeighPerUnit, total] =
      await this.supplyRealTimeRepository.findAndCount({
        take: limit,
        skip: offset,
        order: {
          id: 'desc',
        },
        where: {
          weightPerUnit: Raw((alias) => `CAST(${alias} AS TEXT) LIKE :value`, {
            value: `${value}%`,
          }),
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

    if (!supplyRealTimeFindByWeighPerUnit) {
      throw new NotFoundException('Insumos não encontrado');
    }

    return [total, ...supplyRealTimeFindByWeighPerUnit];
  }

  async FindByTotalWeight(
    paginationByTotalWeightDTO: PaginationByTotalWeightDTO,
  ) {
    const { limit, offset, value } = paginationByTotalWeightDTO;

    const [supplyRealTimeFindByTotalWeight, total] =
      await this.supplyRealTimeRepository.findAndCount({
        take: limit,
        skip: offset,
        order: {
          id: 'desc',
        },
        where: {
          totalWeight: Raw((alias) => `CAST(${alias} AS TEXT) LIKE :value`, {
            value: `${value}%`,
          }),
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

    if (!supplyRealTimeFindByTotalWeight) {
      throw new NotFoundException('Insumos não encontrado');
    }

    return [total, ...supplyRealTimeFindByTotalWeight];
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

    const [supplyFindByExpDate, total] =
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

    return [total, ...supplyFindByExpDate];
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
