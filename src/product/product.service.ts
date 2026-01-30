import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenPayloadDTO } from 'src/auth/dto/token-payload.dto';
import { EmployeeService } from 'src/employee/employee.service';
import { Employee } from 'src/employee/entities/employee.entity';
import { SupplyRealTime } from 'src/supply/entities/supply-realtime.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateProductWithRecipeDTO } from './dto/create-product-with-recipe.dto';
import { CreateProductWithoutRecipeDTO } from './dto/create-product-without-recipe.dto';
import { ProductIngredient } from './entities/product-ingredient.entity';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly employeesService: EmployeeService,
    private dataSource: DataSource,
    private readonly logger: Logger,
  ) {}

  async CreateWithoutRecipe(
    tokenPayloadDTO: TokenPayloadDTO,
    createProductWithoutRecipeDTO: CreateProductWithoutRecipeDTO,
  ) {
    const findEmployee = await this.employeesService.FindById(
      tokenPayloadDTO.sub,
    );

    if (!findEmployee) {
      throw new UnauthorizedException('Funcionário não encontrado');
    }

    const createProduct = this.productRepository.create(
      createProductWithoutRecipeDTO,
    );

    const newProduct = await this.productRepository.save(createProduct);

    if (!createProduct || !newProduct) {
      throw new InternalServerErrorException('Erro ao cadastrar produto');
    }

    return {
      ...newProduct,
    };
  }

  async CreateWithRecipe(
    tokenPayloadDTO: TokenPayloadDTO,
    createProductWithRecipe: CreateProductWithRecipeDTO,
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

    const productIngredientData: ProductIngredient[] = [];

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
        name: createProductWithRecipe.name,
        category: createProductWithRecipe.category,
        unities: createProductWithRecipe.unities,
        expirationDate: createProductWithRecipe.expirationDate,
        lowStock: createProductWithRecipe.lowStock,
        price: createProductWithRecipe.price,
      };

      const createProduct = queryRunner.manager.create(Product, data);

      const newProduct = await queryRunner.manager.save(Product, createProduct);

      for (const supply of createProductWithRecipe.productIngredient) {
        const doesSupplyReallyExists = await queryRunner.manager.findOne(
          SupplyRealTime,
          {
            where: {
              id: supply.supplyId,
            },
          },
        );

        if (!doesSupplyReallyExists) {
          throw new UnauthorizedException(
            `Insumo ${supply.supplyId} da receita do produto ${createProductWithRecipe.name} não encontrado`,
          );
        }

        const productIngredientDataLoop = {
          supplyRealTime: doesSupplyReallyExists,
          product: newProduct,
          employee: doesEmployeeReallyExists,
          quantity: supply.quantity,
        };

        const createProductIngredient = queryRunner.manager.create(
          ProductIngredient,
          productIngredientDataLoop,
        );

        productIngredientData.push(createProductIngredient);
      }

      const newRecipe = await queryRunner.manager.save(
        ProductIngredient,
        productIngredientData,
      );

      await queryRunner.commitTransaction();

      return {
        product: newProduct,
        recipe: newRecipe,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      this.logger.error(`Erro ao cadastrar produto: ${error.message}`);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Falha ao processar transação na criação de produto com receita',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async CreateWithRecipeAndRegisteredSupplies(
    tokenPayloadDTO: TokenPayloadDTO,
    createProductWithRecipe: CreateProductWithRecipeDTO,
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

    const productIngredientData: ProductIngredient[] = [];

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
        name: createProductWithRecipe.name,
        category: createProductWithRecipe.category,
        unities: createProductWithRecipe.unities,
        expirationDate: createProductWithRecipe.expirationDate,
        lowStock: createProductWithRecipe.lowStock,
        price: createProductWithRecipe.price,
      };

      const createProduct = queryRunner.manager.create(Product, data);

      const newProduct = await queryRunner.manager.save(Product, createProduct);

      for (const supply of createProductWithRecipe.productIngredient) {
        const doesSupplyReallyExists = await queryRunner.manager.findOne(
          SupplyRealTime,
          {
            where: {
              id: supply.supplyId,
            },
          },
        );

        if (!doesSupplyReallyExists) {
          throw new UnauthorizedException(
            `Insumo ${supply.supplyId} da receita do produto ${createProductWithRecipe.name} não encontrado`,
          );
        }

        const productIngredientDataLoop = {
          supplyRealTime: doesSupplyReallyExists,
          product: newProduct,
          employee: doesEmployeeReallyExists,
          quantity: supply.quantity,
        };

        const createProductIngredient = queryRunner.manager.create(
          ProductIngredient,
          productIngredientDataLoop,
        );

        productIngredientData.push(createProductIngredient);
      }

      const newRecipe = await queryRunner.manager.save(
        ProductIngredient,
        productIngredientData,
      );

      await queryRunner.commitTransaction();

      return {
        product: newProduct,
        recipe: newRecipe,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      this.logger.error(`Erro ao cadastrar produto: ${error.message}`);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Falha ao processar transação na criação de produto com receita',
      );
    } finally {
      await queryRunner.release();
    }
  }
}
