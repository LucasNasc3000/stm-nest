import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenPayloadDTO } from 'src/auth/dto/token-payload.dto';
import { UrlUuidDTO } from 'src/common/dto/url-uuid.dto';
import { EmployeeService } from 'src/employee/employee.service';
import { GetDateObjectDateSearch } from 'src/utils/get-date-object-date-search';
import { Like, Repository } from 'typeorm';
import { CreateSupplyRealtimeDTO } from './dto/create-supply-realtime.dto';
import { PaginationByCategoryDTO } from './dto/pagination-category.dto';
import { PaginationByEmployeeDTO } from './dto/pagination-employee.dto';
import { PaginationByExpDateDTO } from './dto/pagination-exp-date.dto';
import { PaginationByNameDTO } from './dto/pagination-name.dto';
import { PaginationByPriceDTO } from './dto/pagination-price.dto';
import { PaginationBySupplierDTO } from './dto/pagination-supplier.dto';
import { UpdatePriceSupplyRealTimeDTO } from './dto/update-price-supply-realtime.dto';
import { UpdateSupplyRealTimeDTO } from './dto/update-supply-realtime.dto';
import { SupplyRealTime } from './entities/supply-realtime.entity';

@Injectable()
export class SupplyRealTimeService {
  constructor(
    @InjectRepository(SupplyRealTime)
    private readonly supplyRealTimeRepository: Repository<SupplyRealTime>,
    private readonly employeesService: EmployeeService,
  ) {}

  async Create(
    createSupplyRealTimeDTO: CreateSupplyRealtimeDTO,
    tokenPayloadDTO: TokenPayloadDTO,
  ) {
    const findEmployee = await this.employeesService.FindById(
      tokenPayloadDTO.sub,
    );

    if (!findEmployee) {
      throw new UnauthorizedException('Funcionário não encontrado');
    }

    const data = {
      category: createSupplyRealTimeDTO.category,
      name: createSupplyRealTimeDTO.name,
      quantity: createSupplyRealTimeDTO.quantity,
      totalWeight: createSupplyRealTimeDTO.totalWeight,
      weightPerUnit: createSupplyRealTimeDTO.weightPerUnit,
      supplier: createSupplyRealTimeDTO.supplier,
      expirationDate: createSupplyRealTimeDTO.expirationDate,
      employee: findEmployee,
      lowStock: createSupplyRealTimeDTO.lowStock,
      price: createSupplyRealTimeDTO.price,
    };

    const supplyRealTimeCreate = this.supplyRealTimeRepository.create(data);

    const newSupplyRealTime =
      await this.supplyRealTimeRepository.save(supplyRealTimeCreate);

    return newSupplyRealTime;
  }

  async Update(
    supplyId: UrlUuidDTO,
    updateSupplyRealtimeDTO: UpdateSupplyRealTimeDTO,
  ) {
    const findSupply = await this.supplyRealTimeRepository.findOne({
      where: {
        id: supplyId.id,
      },
    });

    if (!findSupply) {
      throw new NotFoundException('Insumo não encontrado');
    }

    const allowedData = {
      category: updateSupplyRealtimeDTO.category,
      name: updateSupplyRealtimeDTO.name,
      quantity: updateSupplyRealtimeDTO.quantity,
      totalWeight: updateSupplyRealtimeDTO.totalWeight,
      weightPerUnit: updateSupplyRealtimeDTO.weightPerUnit,
      supplier: updateSupplyRealtimeDTO.supplier,
      expirationDate: updateSupplyRealtimeDTO.expirationDate,
      lowStock: updateSupplyRealtimeDTO.lowStock,
    };

    const supplyUpdate = await this.supplyRealTimeRepository.preload({
      id: supplyId.id,
      ...allowedData,
    });

    if (!supplyUpdate) {
      throw new InternalServerErrorException(
        `Erro ao tentar atualizar insumo: ${findSupply.name}`,
      );
    }

    return this.supplyRealTimeRepository.save(supplyUpdate);
  }

  async UpdatePrices(
    supplyId: UrlUuidDTO,
    updatePriceSupplyRealtimeDTO: UpdatePriceSupplyRealTimeDTO,
  ) {
    const findSupply = await this.supplyRealTimeRepository.findOne({
      where: {
        id: supplyId.id,
      },
    });

    if (!findSupply) {
      throw new NotFoundException('Insumo não encontrado');
    }

    const supplyUpdate = await this.supplyRealTimeRepository.preload({
      id: supplyId.id,
      price: updatePriceSupplyRealtimeDTO.price,
    });

    if (!supplyUpdate) {
      throw new InternalServerErrorException(
        `Erro ao tentar atualizar preço do insumo: ${findSupply.name}`,
      );
    }

    return this.supplyRealTimeRepository.save(supplyUpdate);
  }

  async FindById(id: string) {
    const supplyRealTimeFindById =
      await this.supplyRealTimeRepository.findOneBy({
        id,
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

  async FindByWeightPerUnit(weightPerUnit: string) {
    const supplyRealTimeFindByWeighPerUnit =
      await this.supplyRealTimeRepository.findOneBy({
        weightPerUnit,
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
        },
        relations: {
          employee: true,
        },
        select: {
          employee: {
            id: true,
            name: true,
            email: true,
            situation: true,
            role: true,
            boss: true,
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

    const stringToDate = GetDateObjectDateSearch(value);
    const initialDate = stringToDate[0];
    const finalDate = stringToDate[1];

    const supplyFindByExpDate = await this.supplyRealTimeRepository
      .createQueryBuilder('supply_real_time')
      .where(
        'supply_real_time.expiration_date BETWEEN :initialDate AND :finalDate',
        {
          initialDate,
          finalDate,
        },
      )
      .take(limit)
      .skip(offset)
      .getMany();

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
