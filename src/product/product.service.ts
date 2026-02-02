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
import { Outflow } from 'src/outflow/entities/outflow.entity';
import { SupplyRealTime } from 'src/supply/entities/supply-realtime.entity';
import { ReturnDateAndTimeForeignFormat } from 'src/utils/get-date-and-time';
import { DataSource, Repository } from 'typeorm';
import { CreateProductIngredientDTO } from './dto/create-product-ingredient.dto';
import { CreateProductWithRecipeDTO } from './dto/create-product-with-recipe.dto';
import { CreateProductWithoutRecipeDTO } from './dto/create-product-without-recipe.dto';
import { UpdateProductRegularDataDTO } from './dto/update-product-regular-data.dto';
import { UpdateProductDTO } from './dto/update-product.dto';
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

        const totalWeightDecimal = new Decimal(
          doesSupplyReallyExists.totalWeight,
        );

        const weightPerUnitDecimal = new Decimal(
          doesSupplyReallyExists.weightPerUnit,
        );

        const totalWeightPerOutflow = weightPerUnitDecimal.mul(supply.quantity);

        const newTotalWeight = totalWeightDecimal
          .sub(totalWeightPerOutflow)
          .toString();

        const updatedQuantity =
          doesSupplyReallyExists.quantity - supply.quantity;

        const supplyUpdate = await queryRunner.manager.update(
          SupplyRealTime,
          doesSupplyReallyExists.id,
          {
            totalWeight: newTotalWeight,
            quantity: updatedQuantity,
          },
        );

        if (!supplyUpdate || supplyUpdate.affected < 1) {
          throw new InternalServerErrorException(
            `Erro ao atualizar insumo ${doesSupplyReallyExists.name} da receita do produto ${createProductWithRecipe.name}`,
          );
        }

        const dateAndHour = ReturnDateAndTimeForeignFormat();

        const outflowData = {
          date: dateAndHour[0],
          hour: dateAndHour[1],
          name: doesSupplyReallyExists.name,
          category: doesSupplyReallyExists.category,
          reason: 'Cadastro de produto',
          unities: createProductWithRecipe.unities,
          employee: doesEmployeeReallyExists,
          supplyRealTime: doesSupplyReallyExists,
        };

        const createOutflow = queryRunner.manager.create(Outflow, outflowData);

        await queryRunner.manager.save(Outflow, createOutflow);

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

  async Update(productId: UrlUuidDTO, updateProductDTO: UpdateProductDTO) {
    if (!updateProductDTO.price && !updateProductDTO.productIngredient) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { price, productIngredient, ...rest } = updateProductDTO;

      const updateRegularData = await this.UpdateRegularData(rest);

      return updateRegularData;
    }
  }

  private async UpdatePrice(productId: UrlUuidDTO, price: string) {}

  private async UpdateProductIngredient(
    id: UrlUuidDTO,
    productIngredient: CreateProductIngredientDTO[],
  ) {}

  private async UpdateRegularData(
    productId: UrlUuidDTO,
    updateProductRegularDataDTO: UpdateProductRegularDataDTO,
  ) {
    const { id } = productId;

    const findProduct = await this.productRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!findProduct) {
      throw new NotFoundException('Produto não encontrado');
    }

    const productUpdate = await this.productRepository.preload({
      id,
      ...updateProductRegularDataDTO,
    });

    const productUpdated = await this.productRepository.save(productUpdate);

    if (!productUpdate || !productUpdated) {
      throw new InternalServerErrorException(
        `Erro ao tentar atualizar produto: ${findProduct.name}`,
      );
    }

    return productUpdated;
  }
}
