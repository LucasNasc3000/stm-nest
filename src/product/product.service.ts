import {
  BadRequestException,
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
import { OutflowType } from 'src/common/enums/outflow-type.enum';
import { EmployeeService } from 'src/employee/employee.service';
import { Employee } from 'src/employee/entities/employee.entity';
import { Outflow } from 'src/outflow/entities/outflow.entity';
import { SupplyRealTime } from 'src/supply/entities/supply-realtime.entity';
import { ReturnDateAndTimeForeignFormat } from 'src/utils/get-date-and-time';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { CreateProductIngredientDTO } from './dto/create-product-ingredient.dto';
import { CreateProductWithRecipeDTO } from './dto/create-product-with-recipe.dto';
import { CreateProductWithoutRecipeDTO } from './dto/create-product-without-recipe.dto';
import { UpdateProductIngredientDTO } from './dto/update-product-ingredient.dto';
import { UpdateProductRegularDataDTO } from './dto/update-product-regular-data.dto';
import { UpdateProductUnitiesDTO } from './dto/update-product-unities.dto';
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
            lock: { mode: 'pessimistic_write' },
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

  async CreateRecipe(
    tokenPayloadDTO: TokenPayloadDTO,
    productId: UrlUuidDTO,
    createRecipeDTO: CreateProductIngredientDTO[],
    useStockSupplies: boolean,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const outflows: Outflow[] = [];

    const doesProductReallyExists = await queryRunner.manager.findOne(Product, {
      where: {
        id: productId.id,
      },
    });

    if (!doesProductReallyExists) {
      throw new NotFoundException('Produto não encontrado');
    }

    const doesEmployeeReallyExists = await queryRunner.manager.findOne(
      Employee,
      {
        where: {
          id: tokenPayloadDTO.sub,
        },
      },
    );

    if (!doesEmployeeReallyExists) {
      throw new NotFoundException('Funcionário não encontrado');
    }

    try {
      for (const ingredient of createRecipeDTO) {
        const doesSupplyReallyExists = await queryRunner.manager.findOne(
          SupplyRealTime,
          {
            where: {
              id: ingredient.supplyId,
            },
            lock: { mode: 'pessimistic_write' },
          },
        );

        if (!doesSupplyReallyExists) {
          throw new NotFoundException(
            `Insumo ${ingredient.supplyId} não encontrado`,
          );
        }

        const productIngredientData = {
          supplyRealTime: doesSupplyReallyExists,
          product: doesProductReallyExists,
          employee: doesEmployeeReallyExists,
          outflows: null,
          quantity: ingredient.quantity,
        };

        const createProductIngredient = queryRunner.manager.create(
          ProductIngredient,
          productIngredientData,
        );

        const newProductIngredient = await queryRunner.manager.save(
          ProductIngredient,
          createProductIngredient,
        );

        if (useStockSupplies) {
          if (ingredient.quantity < 1) {
            throw new BadRequestException(
              'A quantidade deve ser maior que zero caso se queira usar os insumos em estoque',
            );
          }

          const totalWeightDecimal = new Decimal(
            doesSupplyReallyExists.totalWeight,
          );

          const weightPerUnitDecimal = new Decimal(
            doesSupplyReallyExists.weightPerUnit,
          );

          const totalWeightPerOutflow = weightPerUnitDecimal.mul(
            ingredient.quantity,
          );

          const newTotalWeight = totalWeightDecimal
            .sub(totalWeightPerOutflow)
            .toString();

          const updatedQuantity =
            doesSupplyReallyExists.quantity - ingredient.quantity;

          if (updatedQuantity < 1) {
            throw new BadRequestException(
              `Quantidade insuficiente do insumo ${doesSupplyReallyExists.name}`,
            );
          }

          if (
            updatedQuantity > 0 &&
            updatedQuantity <= doesSupplyReallyExists.lowStock
          ) {
            // Mandar email avisando da quantidade
          }

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
              `Erro ao atualizar insumo ${doesSupplyReallyExists.name} para a receita do produto ${doesProductReallyExists.name}`,
            );
          }

          const dateAndHour = ReturnDateAndTimeForeignFormat();

          const outflowData = {
            date: dateAndHour[0],
            hour: dateAndHour[1],
            name: doesSupplyReallyExists.name,
            category: doesSupplyReallyExists.category,
            reason: 'Criacao de receita',
            unities: ingredient.quantity,
            employee: doesEmployeeReallyExists,
            supplyRealTime: doesSupplyReallyExists,
            ingredient: newProductIngredient,
          };

          const createOutflow = queryRunner.manager.create(
            Outflow,
            outflowData,
          );

          outflows.push(createOutflow);
        }
      }

      if (outflows.length > 0) {
        await queryRunner.manager.save(Outflow, outflows);
      }

      await queryRunner.commitTransaction();

      return {
        message: 'success',
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

  async Update(
    tokenPayloadDTO: TokenPayloadDTO,
    productId: UrlUuidDTO,
    updateProductDTO: UpdateProductDTO,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const updatesPerformed = [];

    try {
      const { id } = productId;

      const findEmployee = await queryRunner.manager.findOne(Employee, {
        where: {
          id: tokenPayloadDTO.sub,
        },
      });

      if (!findEmployee) {
        throw new NotFoundException('Funcionário não encontrado');
      }

      const findProduct = await queryRunner.manager.findOne(Product, {
        where: {
          id: id,
        },
        lock: { mode: 'pessimistic_write' },
      });

      if (!findProduct) {
        throw new NotFoundException('Produto não encontrado');
      }

      if (updateProductDTO.productIngredient.length > 0) {
        await this.UpdateProductIngredient(
          updateProductDTO.productIngredient,
          queryRunner,
        );
      }

      if (updateProductDTO.unities) {
        const updateProductUnitesData = {
          id: findProduct.id,
          addUnities: updateProductDTO.addUnities,
          takeUnities: updateProductDTO.takeUnities,
          productIngredient: updateProductDTO.productIngredient,
        };

        await this.UpdateUnities(
          updateProductUnitesData,
          findProduct,
          findEmployee,
          updateProductDTO.useStockSupplies,
          queryRunner,
        );
      }

      await this.UpdateRegularData(findProduct, updateProductDTO, queryRunner);

      for (let i = 0; i < Object.keys(updateProductDTO).length; i++) {
        updatesPerformed.push(Object.keys(updateProductDTO));
      }

      await queryRunner.commitTransaction();

      const findUpdatedProduct = await this.productRepository.findOne({
        where: {
          id: productId.id,
        },
      });

      return {
        updatedFields: updatesPerformed,
        product: findUpdatedProduct,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      this.logger.error(
        `Erro ao atualizar ingredientes do produto: ${error.message}`,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Falha ao processar transação na atualização dos ingredientes do produto',
      );
    } finally {
      await queryRunner.release();
    }
  }

  // async UpdatePrice(id: UrlUuidDTO) {
  //   const productUpdate = await queryRunner.manager.update(
  //     Product,
  //     product.id,
  //     {
  //       id: product.id,
  //       price,
  //     },
  //   );

  //   if (!productUpdate || productUpdate.affected < 1) {
  //     throw new InternalServerErrorException(
  //       `Erro ao tentar atualizar preço do produto: ${product.name}`,
  //     );
  //   }
  // }

  private async UpdateUnities(
    updateProductUnitiesDTO: UpdateProductUnitiesDTO,
    product: Product,
    employee: Employee,
    useStockSupplies: boolean,
    queryRunner: QueryRunner,
  ) {
    const { addUnities, takeUnities, productIngredient, id } =
      updateProductUnitiesDTO;

    if (addUnities && takeUnities) {
      throw new BadRequestException(
        'Unidades não podem ser tiradas e adicionadas ao mesmo tempo',
      );
    }

    let productUnities: number = 0;
    const outflows: Outflow[] = [];

    // A diminuição das unidades do produto não vai devolver insumos ao estoque, eles já foram usados
    if (useStockSupplies && addUnities > 0) {
      for (const ingredient of productIngredient) {
        const doesSupplyReallyExists = await queryRunner.manager.findOne(
          SupplyRealTime,
          {
            where: {
              id: ingredient.supplyId,
            },
            lock: { mode: 'pessimistic_write' },
          },
        );

        if (!doesSupplyReallyExists) {
          throw new NotFoundException(
            `Insumo ${ingredient.supplyId} não encontrado`,
          );
        }

        const totalWeightDecimal = new Decimal(
          doesSupplyReallyExists.totalWeight,
        );

        const weightPerUnitDecimal = new Decimal(
          doesSupplyReallyExists.weightPerUnit,
        );

        const updatedQuantityByAddUnities = ingredient.quantity * addUnities;

        const totalWeightPerOutflow = weightPerUnitDecimal.mul(
          updatedQuantityByAddUnities,
        );

        const newTotalWeight = totalWeightDecimal
          .sub(totalWeightPerOutflow)
          .toString();

        const updatedQuantity =
          doesSupplyReallyExists.quantity - updatedQuantityByAddUnities;

        if (updatedQuantity < 0) {
          throw new BadRequestException(
            `Quantidade insuficiente do insumo ${doesSupplyReallyExists.name}`,
          );
        }

        if (
          updatedQuantity > 0 &&
          updatedQuantity <= doesSupplyReallyExists.lowStock
        ) {
          if (updatedQuantity === 0) {
            // avisar que acabou
          }

          if (updatedQuantity <= doesSupplyReallyExists.lowStock) {
            // avisar e mandar a quantidade que sobrou
          }
          // Mandar email avisando da quantidade
        }

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
            `Erro ao atualizar insumo ${doesSupplyReallyExists.name} para a receita do produto`,
          );
        }

        const dateAndHour = ReturnDateAndTimeForeignFormat();

        const data = {
          targetType: OutflowType.SUPPLY,
          date: dateAndHour[0],
          hour: dateAndHour[1],
          name: doesSupplyReallyExists.name,
          category: doesSupplyReallyExists.category,
          reason: `Cadastro de novas unidades do produto ${product.name}`,
          unities: updatedQuantityByAddUnities,
          employee,
          supplyRealTime: doesSupplyReallyExists,
        };

        const outflowCreate = queryRunner.manager.create(Outflow, data);

        outflows.push(outflowCreate);
      }

      if (addUnities) productUnities += addUnities;

      if (takeUnities) {
        productUnities -= takeUnities;

        if (productUnities < 0) {
          throw new BadRequestException(
            'A quantidade do produto em estoque não pode ser negativa',
          );
        }

        if (productUnities === 0) {
          // avisar que acabou
        }

        if (productUnities <= product.lowStock) {
          // avisar e mandar quantidade que sobrou
        }

        const dateAndHour = ReturnDateAndTimeForeignFormat();

        const data = {
          targetType: OutflowType.PRODUCT,
          date: dateAndHour[0],
          hour: dateAndHour[1],
          name: product.name,
          category: product.category,
          reason: `Baixa no estoque do produto ${product.name}`,
          unities: takeUnities,
          employee,
          product,
        };

        const outflowCreate = queryRunner.manager.create(Outflow, data);

        outflows.push(outflowCreate);
      }

      await queryRunner.manager.save(Outflow, outflows);

      if (addUnities || takeUnities) {
        const updateProduct = await queryRunner.manager.update(Product, id, {
          unities: productUnities,
        });

        if (!updateProduct || updateProduct.affected < 1) {
          throw new InternalServerErrorException(
            'Erro ao atualizar quantidade do produto',
          );
        }
      }
    }
  }

  private async UpdateProductIngredient(
    productIngredient: UpdateProductIngredientDTO[],
    queryRunner: QueryRunner,
  ) {
    for (const ingredient of productIngredient) {
      const findIngredient = await queryRunner.manager.findOne(
        ProductIngredient,
        {
          where: {
            id: ingredient.id,
            product: {
              id: ingredient.supplyId,
            },
            isActive: true,
          },
          lock: { mode: 'pessimistic_write' },
        },
      );

      if (!findIngredient) {
        throw new NotFoundException(
          `Ingrediente ${ingredient.id} não encontrado`,
        );
      }

      if (ingredient.disableProduct === true) {
        const disableIngredient = await queryRunner.manager.update(
          ProductIngredient,
          findIngredient.id,
          {
            isActive: false,
          },
        );

        if (!disableIngredient || disableIngredient.affected < 1) {
          throw new InternalServerErrorException(
            `Erro ao remover ingrediente ${ingredient.id}`,
          );
        }

        continue;
      }

      if (ingredient.quantity > 0) {
        if (findIngredient.isActive !== true) {
          throw new BadRequestException(
            `Não é possível atualizar o ingrediente ${ingredient.id}, está inativo`,
          );
        }

        const findSupply = await queryRunner.manager.findOne(SupplyRealTime, {
          where: {
            id: ingredient.supplyId,
          },
        });

        if (!findSupply) {
          throw new NotFoundException(
            `Insumo ${ingredient.supplyId} do ingrediente ${ingredient.id} não encontrado`,
          );
        }

        const updateIngredientQuantity = await queryRunner.manager.update(
          ProductIngredient,
          findIngredient.id,
          {
            quantity: ingredient.quantity,
          },
        );

        if (
          !updateIngredientQuantity ||
          updateIngredientQuantity.affected < 1
        ) {
          throw new InternalServerErrorException(
            `Erro ao atualizar quantidade do ingrediente ${ingredient.id}`,
          );
        }
      }
    }
  }

  private async UpdateRegularData(
    product: Product,
    updateProductRegularDataDTO: UpdateProductRegularDataDTO,
    queryRunner: QueryRunner,
  ) {
    if (Object.keys(updateProductRegularDataDTO).length < 1) return;

    const productUpdate = await queryRunner.manager.update(
      Product,
      product.id,
      {
        id: product.id,
        ...updateProductRegularDataDTO,
      },
    );

    if (!productUpdate || productUpdate.affected < 1) {
      throw new InternalServerErrorException(
        `Erro ao tentar atualizar produto: ${product.name}`,
      );
    }
  }
}
