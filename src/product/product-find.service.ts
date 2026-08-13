import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductSearch } from 'src/common/enums/product-search.enum';
import { Formatter } from 'src/utils/format-timezone';
import { ILike, Repository, SelectQueryBuilder } from 'typeorm';
import { PaginationByCategoryDTO } from './dto/pagination-category.dto';
import { PaginationByDateDTO } from './dto/pagination-date.dto';
import { PaginationByEmployeeDTO } from './dto/pagination-employee.dto';
import { PaginationByInflowEmployeeDTO } from './dto/pagination-inflow-employee.dto';
import { PaginationByInflowExpDateDTO } from './dto/pagination-inflow-exp-date.dto';
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

  QueryBuilderGenerator(
    product: ProductSearch,
  ): SelectQueryBuilder<Product | ProductInflow> {
    let query: SelectQueryBuilder<ProductInflow | Product>;

    switch (product) {
      case ProductSearch.PRODUCT_INFLOW:
        query = this.productInflowRepository
          .createQueryBuilder('product_general')
          .leftJoin('product_general.employee', 'employee')
          .leftJoin('product_general.product', 'product')
          .select([
            'employee.id',
            'employee.email',
            'product',
            'product_general',
          ]);
        break;

      case ProductSearch.PRODUCT:
        query = this.productRepository
          .createQueryBuilder('product_general')
          .where('product_general.is_active = true')
          .leftJoin('product_general.employee', 'employee')
          .leftJoin('product_general.recipe', 'recipe')
          .select([
            'employee.id',
            'employee.email',
            'recipe',
            'product_general',
          ]);
        break;

      default:
        throw new InternalServerErrorException(
          'Tipo não definido para query builder',
        );
    }

    return query;
  }

  FormatterForSearch(productsFound: (ProductInflow | Product)[]) {
    return productsFound.map((product) => ({
      ...product,
      createdAt: Formatter(product.createdAt),
      updatedAt: Formatter(product.updatedAt),
    }));
  }

  async FindByName(paginationByNameDTO: PaginationByNameDTO) {
    const { limit, offset, value, productType, forDisplay } =
      paginationByNameDTO;

    const query = this.QueryBuilderGenerator(productType);

    query
      .andWhere('product_general.name ILIKE :name', { name: `${value}%` })
      .orderBy('product_general.id', 'DESC')
      .take(limit)
      .skip(offset);

    const [productFindByName, total] = await query.getManyAndCount();

    if (!productFindByName) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por produtos',
      );
    }

    if (productFindByName.length < 1 && !forDisplay) {
      throw new NotFoundException('Produtos não encontrados');
    }

    const formattedCreatedAndUpdatedAt =
      this.FormatterForSearch(productFindByName);

    return [total, formattedCreatedAndUpdatedAt];
  }

  async FindByCategory(paginationByCategoryDTO: PaginationByCategoryDTO) {
    const { limit, offset, value, productType } = paginationByCategoryDTO;

    const query = this.QueryBuilderGenerator(productType);

    query
      .andWhere('product_general.category ILIKE :category', {
        category: `${value}%`,
      })
      .orderBy('product_general.id', 'DESC')
      .take(limit)
      .skip(offset);

    const [productFindByCategory, total] = await query.getManyAndCount();

    if (!productFindByCategory) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por produtos',
      );
    }

    if (productFindByCategory.length < 1) {
      throw new NotFoundException('Produtos não encontrados');
    }

    const formattedCreatedAndUpdatedAt = this.FormatterForSearch(
      productFindByCategory,
    );

    return [total, formattedCreatedAndUpdatedAt];
  }

  async FindByPrice(paginationByPriceDTO: PaginationByPriceDTO) {
    const { limit, offset, value, productType } = paginationByPriceDTO;

    const query = this.QueryBuilderGenerator(productType);

    query
      .andWhere('CAST(product.price AS TEXT) LIKE :price', {
        price: `${value}%`,
      })
      .orderBy('product_general.id', 'DESC')
      .take(limit)
      .skip(offset);

    const [productFindByPrice, total] = await query.getManyAndCount();

    if (!productFindByPrice) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por produtos',
      );
    }

    if (productFindByPrice.length < 1) {
      throw new NotFoundException('Produtos não encontrados');
    }

    const formattedCreatedAndUpdatedAt =
      this.FormatterForSearch(productFindByPrice);

    return [total, formattedCreatedAndUpdatedAt];
  }

  async FindByDate(paginatioByDateDTO: PaginationByDateDTO) {
    const { limit, offset, value, productType } = paginatioByDateDTO;

    const query = this.QueryBuilderGenerator(productType);

    query
      .andWhere('product_general.created_at BETWEEN :startDate AND :endDate', {
        startDate: new Date(`${value}T00:00:00`),
        endDate: new Date(`${value}T23:59:59`),
      })
      .orderBy('product_general.id', 'DESC')
      .take(limit)
      .skip(offset);

    const [productFindByDate, total] = await query.getManyAndCount();

    if (!productFindByDate) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por registros de produtos',
      );
    }

    if (productFindByDate.length < 1) {
      throw new NotFoundException('Registros de produtos não encontrados');
    }

    const formattedCreatedAndUpdatedAt =
      this.FormatterForSearch(productFindByDate);

    return [total, formattedCreatedAndUpdatedAt];
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
          product: true,
          supplyRealTime: true,
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
          supplyRealTime: {
            id: true,
            name: true,
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
    const { limit, offset, email, id, forDisplay } = paginationByInflowDto;

    const conditionalWhere = email ? { email: email } : { id: id };

    const [inflowFindByEmployee, total] =
      await this.productInflowRepository.findAndCount({
        take: limit,
        skip: offset,
        order: {
          id: 'desc',
        },
        where: {
          employee: conditionalWhere,
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
        'Erro desconhecido ao tentar pesquisar por registros de produtos',
      );
    }

    if (inflowFindByEmployee.length < 1 && !forDisplay) {
      throw new NotFoundException('Registros de produtos não encontrados');
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
            name: ILike(`${value}%`),
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
        'Erro desconhecido ao tentar pesquisar por registros de produtos',
      );
    }

    if (inflowFindByProduct.length < 1) {
      throw new NotFoundException('Registros de produtos não encontrados');
    }

    return [total, inflowFindByProduct];
  }

  async FindInflowByExpirationDate(
    paginationByExpDto: PaginationByInflowExpDateDTO,
  ) {
    const { limit, offset, value } = paginationByExpDto;

    const [inflowFindByProduct, total] =
      await this.productInflowRepository.findAndCount({
        take: limit,
        skip: offset,
        order: {
          id: 'desc',
        },
        where: {
          expirationDate: value,
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
        'Erro desconhecido ao tentar pesquisar por registros de produtos',
      );
    }

    if (inflowFindByProduct.length < 1) {
      throw new NotFoundException('Registros de produtos não encontrados');
    }

    return [total, inflowFindByProduct];
  }
}
