import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Raw, Repository } from 'typeorm';
import { PaginationByCategoryDTO } from './dto/pagination-category.dto';
import { PaginationByEmployeeDTO } from './dto/pagination-employee.dto';
import { PaginationByExpDateDTO } from './dto/pagination-exp-date.dto';
import { PaginationByInflowDateDTO } from './dto/pagination-inflow-date.dto';
import { PaginationByInflowEmployeeDTO } from './dto/pagination-inflow-employee.dto';
import { PaginationByInflowProductDTO } from './dto/pagination-inflow-product.dto';
import { PaginationByIngredientDTO } from './dto/pagination-ingredient.dto';
import { PaginationByNameDTO } from './dto/pagination-name.dto';
import { PaginationByPriceDTO } from './dto/pagination-price.dto';
import { ProductInflow } from './entities/product-inflow.entity';
import { ProductIngredient } from './entities/product-ingredient.entity';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductFindService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductIngredient)
    private readonly productIngredientRepository: Repository<ProductIngredient>,
    @InjectRepository(ProductInflow)
    private readonly productInflowRepository: Repository<ProductInflow>,
  ) {}

  async FindByName(paginationByNameDTO: PaginationByNameDTO) {
    const { limit, offset, value } = paginationByNameDTO;

    const [productFindByName, total] =
      await this.productRepository.findAndCount({
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

    if (!productFindByName) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por produtos',
      );
    }

    if (productFindByName.length < 1) {
      throw new NotFoundException('Produtos não encontrados');
    }

    return [total, productFindByName];
  }

  async FindByCategory(paginationByCategoryDTO: PaginationByCategoryDTO) {
    const { limit, offset, value } = paginationByCategoryDTO;

    const [productFindByCategory, total] =
      await this.productRepository.findAndCount({
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

    if (!productFindByCategory) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por produtos',
      );
    }

    if (productFindByCategory.length < 1) {
      throw new NotFoundException('Produtos não encontrados');
    }

    return [total, productFindByCategory];
  }

  async FindByExpirationDate(paginatioByExpDateDTO: PaginationByExpDateDTO) {
    const { limit, offset, value } = paginatioByExpDateDTO;

    const productFindByExpDate = await this.productRepository.findAndCount({
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

    if (!productFindByExpDate) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por produtos',
      );
    }

    if (productFindByExpDate.length < 1) {
      throw new NotFoundException('Produtos não encontrados');
    }

    return productFindByExpDate;
  }

  async FindByPrice(paginationByPriceDTO: PaginationByPriceDTO) {
    const { limit, offset, value } = paginationByPriceDTO;

    const [productFindByPrice, total] =
      await this.productRepository.findAndCount({
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

    if (!productFindByPrice) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por produtos',
      );
    }

    if (productFindByPrice.length < 1) {
      throw new NotFoundException('Produtos não encontrados');
    }

    return [total, productFindByPrice];
  }

  async FindByEmployee(
    paginationByEmployeeDTO: PaginationByEmployeeDTO,
  ): Promise<[number, Product[]]> {
    const { limit, offset, value, forDisplay } = paginationByEmployeeDTO;

    const [productFindByEmployee, total] =
      await this.productRepository.findAndCount({
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
          recipe: true,
        },
        select: {
          employee: {
            id: true,
            email: true,
          },
        },
      });

    if (!productFindByEmployee) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por produtos',
      );
    }

    if (productFindByEmployee.length < 1 && !forDisplay) {
      throw new NotFoundException('Produtos não encontrados');
    }

    return [total, productFindByEmployee];
  }

  async FindIngredientByProduct(
    paginationByIngredientDTO: PaginationByIngredientDTO,
  ): Promise<[number, ProductIngredient[]]> {
    const { limit, offset, value, forDisplay } = paginationByIngredientDTO;

    const [productFindByEmployee, total] =
      await this.productIngredientRepository.findAndCount({
        take: limit,
        skip: offset,
        order: {
          id: 'desc',
        },
        where: {
          product: {
            id: value,
          },
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
          product: {
            id: true,
            name: true,
            category: true,
          },
        },
      });

    if (!productFindByEmployee) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por ingredientes',
      );
    }

    if (productFindByEmployee.length < 1 && !forDisplay) {
      throw new NotFoundException('Ingredientes não encontrados');
    }

    return [total, productFindByEmployee];
  }

  async FindInflowByEmployee(
    paginationByInflowDto: PaginationByInflowEmployeeDTO,
  ): Promise<[number, ProductInflow[]]> {
    const { limit, offset, value, forDisplay } = paginationByInflowDto;

    const [inflowFindByEmployee, total] =
      await this.productInflowRepository.findAndCount({
        take: limit,
        skip: offset,
        order: {
          id: 'desc',
        },
        where: {
          employee: {
            email: value,
          },
        },
        relations: {
          product: true,
          employee: true,
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

    if (!inflowFindByEmployee) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por atualizações',
      );
    }

    if (inflowFindByEmployee.length < 1 && !forDisplay) {
      throw new NotFoundException('Atualizações não encontrados');
    }

    return [total, inflowFindByEmployee];
  }

  async FindInflowByProduct(
    paginationByInflowDto: PaginationByInflowProductDTO,
  ) {
    const { limit, offset, value } = paginationByInflowDto;

    const [inflowFindByProduct, total] =
      await this.productInflowRepository.findAndCount({
        take: limit,
        skip: offset,
        order: {
          id: 'desc',
        },
        where: {
          product: {
            name: value,
          },
        },
        relations: {
          product: true,
          employee: true,
        },
        select: {
          employee: {
            id: true,
            email: true,
          },
          product: {
            id: true,
            name: true,
            category: true,
          },
        },
      });

    if (!inflowFindByProduct) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por atualizações',
      );
    }

    if (inflowFindByProduct.length < 1) {
      throw new NotFoundException('Atualizações não encontrados');
    }

    return [total, inflowFindByProduct];
  }

  async FindInflowByDate(paginationByInflowDto: PaginationByInflowDateDTO) {
    const { limit, offset, value } = paginationByInflowDto;

    const [inflowFindByDate, total] =
      await this.productInflowRepository.findAndCount({
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
          product: true,
          employee: true,
        },
        select: {
          employee: {
            id: true,
            email: true,
          },
          product: {
            id: true,
            name: true,
            category: true,
          },
        },
      });

    if (!inflowFindByDate) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por atualizações',
      );
    }

    if (inflowFindByDate.length < 1) {
      throw new NotFoundException('Atualizações não encontrados');
    }

    return [total, inflowFindByDate];
  }
}
