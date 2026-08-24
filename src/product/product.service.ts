/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Decimal from 'decimal.js';
import { TokenPayloadDTO } from 'src/auth/dto/token-payload.dto';
import { GeneralErrorType } from 'src/common/enums/general-error-type.enum';
import { OutflowReason } from 'src/common/enums/outflow-reason.enum';
import { OutflowType } from 'src/common/enums/outflow-type.enum';
import { ProductInflowReason } from 'src/common/enums/product-inflow-reason.enum';
import { EmployeeService } from 'src/employee/employee.service';
import { Employee } from 'src/employee/entities/employee.entity';
import { Outflow } from 'src/outflow/entities/outflow.entity';
import { SupplyRealTime } from 'src/supply/entities/supply-realtime.entity';
import { ErrorManagement } from 'src/utils/error.util';
import { Formatter } from 'src/utils/format-timezone';
import { DataSource, QueryRunner, Repository, UpdateResult } from 'typeorm';
import { AddProductIngredientDTO } from './dto/add-product-ingredient.dto';
import { CreateProductWithRecipeDTO } from './dto/create-product-with-recipe.dto';
import { CreateProductWithoutRecipeDTO } from './dto/create-product-without-recipe.dto';
import { UpdateProductIngredientDTO } from './dto/update-product-ingredient.dto';
import { UpdatePriceProductDTO } from './dto/update-product-price.dto';
import { UpdateProductRegularDataDTO } from './dto/update-product-regular-data.dto';
import { UpdateProductUnitiesDTO } from './dto/update-product-unities.dto';
import { UpdateProductDTO } from './dto/update-product.dto';
import { ProductInflow } from './entities/product-inflow.entity';
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
    let newProduct: Product;

    try {
      await this.dataSource.transaction(async (manager) => {
        const findEmployee = await manager.findOne(Employee, {
          where: {
            id: tokenPayloadDTO.sub,
          },
        });

        if (!findEmployee) {
          throw new UnauthorizedException('Funcionário não encontrado');
        }

        const { expirationDate, ...rest } = createProductWithoutRecipeDTO;

        const createProduct = manager.create(Product, {
          ...rest,
          employee: findEmployee,
        });

        newProduct = await manager.save(Product, createProduct);

        const createProductInflow = manager.create(ProductInflow, {
          name: newProduct.name,
          category: newProduct.category,
          unities: createProductWithoutRecipeDTO.unities ?? 0,
          inflowReason: ProductInflowReason.ENTRY,
          price: createProductWithoutRecipeDTO.price,
          useStockSupplies: false,
          expirationDate: createProductWithoutRecipeDTO.expirationDate,
          notes: null,
          product: newProduct,
          employee: findEmployee,
        });

        await manager.save(ProductInflow, createProductInflow);
      });

      return {
        newProduct,
      };
    } catch (error) {
      ErrorManagement(error, GeneralErrorType.INTERNAL, {
        logger: 'Erro ao criar produto sem receita:',
        queryFailedError: 'Erro ao registrar produto sem receita',
        internalServerError: 'Erro interno ao criar produto sem receita',
        generalError:
          'Falha ao processar transação na criação de produto sem receita',
      });
    }
  }

  async CreateWithRecipe(
    tokenPayloadDTO: TokenPayloadDTO,
    createProductWithRecipeDTO: CreateProductWithRecipeDTO,
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

      const createProduct = queryRunner.manager.create(Product, {
        name: createProductWithRecipeDTO.name,
        category: createProductWithRecipeDTO.category,
        lowStock: createProductWithRecipeDTO.lowStock || null,
        price: createProductWithRecipeDTO.price,
        unities: 0,
        employee: doesEmployeeReallyExists,
      });

      const newProduct = await queryRunner.manager.save(Product, createProduct);

      const createProductInflow = queryRunner.manager.create(ProductInflow, {
        name: newProduct.name,
        category: newProduct.category,
        unities: 0,
        inflowReason: ProductInflowReason.ENTRY,
        price: createProductWithRecipeDTO.price,
        useStockSupplies: false,
        expirationDate: createProductWithRecipeDTO.expirationDate,
        notes: null,
        product: newProduct,
        employee: findEmployee,
      });

      await queryRunner.manager.save(ProductInflow, createProductInflow);

      for (const supply of createProductWithRecipeDTO.productIngredient) {
        const doesSupplyReallyExists = await queryRunner.manager.findOne(
          SupplyRealTime,
          {
            where: {
              id: supply.supplyId,
              isActive: true,
            },
          },
        );

        if (!doesSupplyReallyExists) {
          throw new UnauthorizedException(
            `Insumo ${supply.supplyId} da receita do produto ${createProductWithRecipeDTO.name} não encontrado`,
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

      ErrorManagement(error, GeneralErrorType.INTERNAL, {
        logger: 'Erro ao criar produto com receita:',
        queryFailedError: 'Erro ao registrar produto com receita',
        internalServerError: 'Erro interno ao criar produto com receita',
        generalError:
          'Falha ao processar transação na criação de produto com receita',
      });
    } finally {
      await queryRunner.release();
    }
  }

  async CreateWithRecipeAndRegisteredSupplies(
    tokenPayloadDTO: TokenPayloadDTO,
    createProductWithRecipeDTO: CreateProductWithRecipeDTO,
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

    const outflows: Outflow[] = [];
    const newRecipe: ProductIngredient[] = [];

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
        name: createProductWithRecipeDTO.name,
        category: createProductWithRecipeDTO.category,
        unities: createProductWithRecipeDTO.unities,
        lowStock: createProductWithRecipeDTO.lowStock || null,
        price: createProductWithRecipeDTO.price,
        employee: doesEmployeeReallyExists,
      };

      const createProduct = queryRunner.manager.create(Product, data);

      const newProduct = await queryRunner.manager.save(Product, createProduct);

      const createProductInflow = queryRunner.manager.create(ProductInflow, {
        name: newProduct.name,
        category: newProduct.category,
        unities: createProductWithRecipeDTO.unities,
        inflowReason: ProductInflowReason.ENTRY,
        price: createProductWithRecipeDTO.price,
        useStockSupplies: true,
        expirationDate: createProductWithRecipeDTO.expirationDate,
        notes: null,
        product: newProduct,
        employee: findEmployee,
      });

      await queryRunner.manager.save(ProductInflow, createProductInflow);

      for (const supply of createProductWithRecipeDTO.productIngredient) {
        const doesSupplyReallyExists = await queryRunner.manager.findOne(
          SupplyRealTime,
          {
            where: {
              id: supply.supplyId,
              isActive: true,
            },
            lock: { mode: 'pessimistic_write' },
          },
        );

        if (!doesSupplyReallyExists) {
          throw new UnauthorizedException(
            `Insumo ${supply.supplyId} da receita do produto ${createProductWithRecipeDTO.name} não encontrado`,
          );
        }

        const totalWeightDecimal = new Decimal(
          doesSupplyReallyExists.totalWeight,
        );

        const newTotalWeight = totalWeightDecimal.sub(supply.quantity);

        if (newTotalWeight.lessThan(0)) {
          throw new BadRequestException(
            `Estoque insuficiente para ${supply.supplyId}`,
          );
        }

        const updatedQuantity = Math.ceil(
          newTotalWeight.div(doesSupplyReallyExists.weightPerUnit).toNumber(),
        );

        const supplyUpdate = await queryRunner.manager.update(
          SupplyRealTime,
          doesSupplyReallyExists.id,
          {
            totalWeight: newTotalWeight.toString(),
            quantity: updatedQuantity,
          },
        );

        if (!supplyUpdate || supplyUpdate.affected < 1) {
          throw new InternalServerErrorException(
            `Erro ao atualizar insumo ${doesSupplyReallyExists.name} da receita do produto ${createProductWithRecipeDTO.name}`,
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

        const newRecipeLoop = await queryRunner.manager.save(
          ProductIngredient,
          createProductIngredient,
        );

        newRecipe.push(newRecipeLoop);

        const outflowData = {
          name: doesSupplyReallyExists.name,
          category: doesSupplyReallyExists.category,
          reason: OutflowReason.PRODUCT_REGISTER,
          quantity: supply.quantity,
          employee: doesEmployeeReallyExists,
          supplyRealTime: doesSupplyReallyExists,
          targetType: OutflowType.SUPPLY,
          product: newProduct,
          ingredient: newRecipeLoop,
        };

        const createOutflow = queryRunner.manager.create(Outflow, outflowData);

        outflows.push(createOutflow);
      }

      await queryRunner.manager.save(Outflow, outflows);

      await queryRunner.commitTransaction();

      return {
        product: newProduct,
        recipe: newRecipe,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      ErrorManagement(error, GeneralErrorType.INTERNAL, {
        logger: 'Erro ao criar produto com receita cadastrada:',
        queryFailedError: 'Erro ao cadastrar produto com receita cadastrada',
        internalServerError:
          'Erro interno ao criar produto com receita cadastrada',
        generalError:
          'Falha ao processar transação na criação de produto com receita cadastrada',
      });
    } finally {
      await queryRunner.release();
    }
  }

  async Update(
    tokenPayloadDTO: TokenPayloadDTO,
    productId: string,
    updateProductDTO: UpdateProductDTO,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const updatesPerformed = [];
    const recipe: ProductIngredient[] = [];

    try {
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
          id: productId,
          is_active: true,
        },
        lock: { mode: 'pessimistic_write' },
      });

      if (!findProduct) {
        throw new NotFoundException('Produto não encontrado ou excluído');
      }

      const findInflows = await queryRunner.manager.find(ProductInflow, {
        where: {
          product: {
            id: findProduct.id,
          },
        },
      });

      const { addUnities, updateProductIngredient, useStockSupplies } =
        updateProductDTO;

      const needsRecipe = addUnities && useStockSupplies;

      if (updateProductIngredient || needsRecipe) {
        const findProductIngredient = await queryRunner.manager.find(
          ProductIngredient,
          {
            where: {
              product: {
                id: findProduct.id,
              },
              isActive: true,
            },
            relations: {
              supplyRealTime: true,
            },
          },
        );

        if (findProductIngredient.length < 1) {
          throw new NotFoundException('Receita não encontrada');
        }

        if (!findProductIngredient) {
          throw new InternalServerErrorException('Erro ao buscar receita');
        }

        recipe.push(...findProductIngredient);
      }

      if (updateProductDTO.updateProductIngredient) {
        await this.UpdateProductIngredient(
          updateProductDTO.updateProductIngredient,
          queryRunner,
        );
      }

      if (updateProductDTO.addProductIngredient) {
        await this.AddIngredients(
          updateProductDTO.addProductIngredient,
          findProduct,
          findEmployee,
          queryRunner,
        );
      }

      if (updateProductDTO.addUnities || updateProductDTO.takeUnities) {
        const updateProductUnitesData: UpdateProductUnitiesDTO = {
          id: findProduct.id,
          addUnities: updateProductDTO.addUnities,
          takeUnities: updateProductDTO.takeUnities,
          addUnitiesReason: updateProductDTO.addUnitiesReason,
          takeUnitiesReason: updateProductDTO.takeUnitiesReason,
          useStockSupplies: updateProductDTO.useStockSupplies,
          expirationDate: updateProductDTO.expirationDate,
          notes: updateProductDTO.notes,
        };

        await this.UpdateUnities(
          updateProductUnitesData,
          findProduct,
          findInflows,
          recipe,
          findEmployee,
          updateProductDTO.useStockSupplies,
          queryRunner,
        );
      }

      if (updateProductDTO.disableProduct === true) {
        await this.DisableProduct(findProduct, queryRunner);
      }

      const regularData: UpdateProductRegularDataDTO = {
        name: updateProductDTO.name,
        category: updateProductDTO.category,
        lowStock: updateProductDTO.lowStock,
      };

      await this.UpdateRegularData(findProduct, regularData, queryRunner);

      await queryRunner.commitTransaction();

      const recoverUpdatedProduct = await this.productRepository.findOne({
        where: {
          id: productId,
        },
      });

      const formattedCreatedAt = Formatter(recoverUpdatedProduct.createdAt);
      const formattedUpdatedAt = Formatter(recoverUpdatedProduct.updatedAt);

      for (let i = 0; i < Object.keys(updateProductDTO).length; i++) {
        updatesPerformed.push(Object.keys(updateProductDTO));
      }

      return {
        updatedProduct: {
          ...recoverUpdatedProduct,
          formattedCreatedAt,
          formattedUpdatedAt,
        },
        updatedFields: updatesPerformed,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      ErrorManagement(error, GeneralErrorType.INTERNAL, {
        logger: 'Erro ao atualizar dados do produto:',
        queryFailedError: 'Erro ao atualizar registro de produto',
        internalServerError: 'Erro interno ao atualizar produto',
        generalError: 'Falha ao processar transação na atualização do produto',
      });
    } finally {
      await queryRunner.release();
    }
  }

  async UpdatePrice(idParam: string, priceParam: UpdatePriceProductDTO) {
    const { price } = priceParam;

    const findProduct = await this.productRepository.findOne({
      where: {
        id: idParam,
        is_active: true,
      },
    });

    if (!findProduct) {
      throw new NotFoundException('Produto não encontrado');
    }

    const productUpdate = await this.productRepository.preload({
      id: idParam,
      price,
    });

    const productUpdated = await this.productRepository.save(productUpdate);

    if (!productUpdate || !productUpdated) {
      throw new InternalServerErrorException(
        `Erro ao tentar atualizar preço do produto: ${findProduct.name}`,
      );
    }

    return productUpdated;
  }

  private async UpdateUnities(
    updateProductUnitiesDTO: UpdateProductUnitiesDTO,
    product: Product,
    inflows: ProductInflow[],
    recipe: ProductIngredient[],
    employee: Employee,
    useStockSupplies: boolean,
    queryRunner: QueryRunner,
  ) {
    const { addUnities, takeUnities, id } = updateProductUnitiesDTO;

    if (addUnities && takeUnities) {
      throw new BadRequestException(
        'Unidades não podem ser tiradas e adicionadas ao mesmo tempo',
      );
    }

    let productUnities: number = product.unities;
    const outflows: Outflow[] = [];

    // A diminuição das unidades do produto não vai devolver insumos ao estoque, eles já foram usados
    if (useStockSupplies && addUnities > 0) {
      for (const ingredient of recipe) {
        const doesSupplyReallyExists = await queryRunner.manager.findOne(
          SupplyRealTime,
          {
            where: {
              id: ingredient.supplyRealTime.id,
              isActive: true,
            },
            lock: { mode: 'pessimistic_write' },
          },
        );

        if (!doesSupplyReallyExists) {
          throw new NotFoundException(
            `Insumo ${ingredient.supplyRealTime.id} não encontrado`,
          );
        }

        const totalWeightDecimal = new Decimal(
          doesSupplyReallyExists.totalWeight,
        );

        const decimalIngredientQuantity = new Decimal(ingredient.quantity);

        const updatedQuantityByAddUnities = decimalIngredientQuantity
          .mul(addUnities)
          .toString();

        const newTotalWeight = totalWeightDecimal.sub(
          updatedQuantityByAddUnities,
        );

        const updatedQuantity = Math.ceil(
          newTotalWeight.div(doesSupplyReallyExists.weightPerUnit).toNumber(),
        );

        if (newTotalWeight.lessThan(0)) {
          throw new BadRequestException(
            `Estoque insuficiente para ${doesSupplyReallyExists.name}`,
          );
        }

        if (Number(newTotalWeight) < 0) {
          throw new BadRequestException(
            `Peso do insumo ${doesSupplyReallyExists.name} não pode ser menor que 0`,
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
            totalWeight: newTotalWeight.toString(),
            quantity: updatedQuantity,
          },
        );

        if (!supplyUpdate || supplyUpdate.affected < 1) {
          throw new InternalServerErrorException(
            `Erro ao atualizar insumo ${doesSupplyReallyExists.name} para a receita do produto`,
          );
        }

        const data = {
          targetType: OutflowType.SUPPLY,
          name: doesSupplyReallyExists.name,
          category: doesSupplyReallyExists.category,
          reason: OutflowReason.PRODUCT_REGISTER,
          notes: updateProductUnitiesDTO.notes || null,
          quantity: updatedQuantityByAddUnities,
          employee,
          supplyRealTime: doesSupplyReallyExists,
          product,
          ingredient,
        };

        const outflowCreate = queryRunner.manager.create(Outflow, data);

        outflows.push(outflowCreate);
      }
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

      const data = {
        targetType: OutflowType.PRODUCT,
        name: product.name,
        category: product.category,
        reason: updateProductUnitiesDTO.takeUnitiesReason,
        notes: updateProductUnitiesDTO.notes || null,
        unities: takeUnities,
        employee,
        product,
      };

      const outflowCreate = queryRunner.manager.create(Outflow, data);

      outflows.push(outflowCreate);
    }

    await queryRunner.manager.save(Outflow, outflows);

    let updateProduct: UpdateResult;

    if (addUnities) {
      updateProduct = await queryRunner.manager.update(Product, id, {
        unities: productUnities,
      });

      const [lastInflow] = inflows.map((i) => {
        const allSeq = [i.seq];
        return Math.max(...allSeq);
      });

      const [lastInflowData] = inflows.map((i) => {
        if (Number(i.seq) === lastInflow) return i;
      });

      const createInflow = queryRunner.manager.create(ProductInflow, {
        name: product.name,
        category: product.category,
        unities: addUnities,
        inflowReason: updateProductUnitiesDTO.addUnitiesReason,
        notes: updateProductUnitiesDTO.notes || null,
        price: product.price,
        useStockSupplies: updateProductUnitiesDTO.useStockSupplies,
        product: product,
        employee: employee,
        expirationDate:
          updateProductUnitiesDTO.expirationDate ||
          lastInflowData.expirationDate,
      });

      await queryRunner.manager.save(ProductInflow, createInflow);
    }

    if (takeUnities) {
      updateProduct = await queryRunner.manager.update(Product, id, {
        unities: productUnities,
      });
    }

    if (!updateProduct || updateProduct.affected < 1) {
      throw new InternalServerErrorException(
        'Erro ao atualizar quantidade do produto',
      );
    }
  }

  private async AddIngredients(
    productIngredient: AddProductIngredientDTO[],
    product: Product,
    employee: Employee,
    queryRunner: QueryRunner,
  ) {
    for (const ingredient of productIngredient) {
      const findSupply = await queryRunner.manager.findOne(SupplyRealTime, {
        where: {
          id: ingredient.supplyId,
          isActive: true,
        },
      });

      if (!findSupply) {
        throw new NotFoundException(
          `Insumo ${ingredient.supplyId} não encontrado ou inativo`,
        );
      }

      const productIngredientData = {
        quantity: ingredient.quantity,
        supplyRealTime: findSupply,
        product,
        employee,
      };

      const createProductIngredient = queryRunner.manager.create(
        ProductIngredient,
        productIngredientData,
      );

      await queryRunner.manager.save(
        ProductIngredient,
        createProductIngredient,
      );
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
            isActive: true,
          },
          lock: { mode: 'pessimistic_write' },
        },
      );

      if (!findIngredient) {
        throw new NotFoundException(
          `Ingrediente ${ingredient.id} não encontrado ou inativo`,
        );
      }

      if (ingredient.disableIngredient === true) {
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

      if (ingredient.quantity) {
        if (findIngredient.isActive !== true) {
          throw new BadRequestException(
            `Não é possível atualizar o ingrediente ${ingredient.id}, está inativo`,
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

  private async DisableProduct(product: Product, queryRunner: QueryRunner) {
    const productUpdate = await queryRunner.manager.update(
      Product,
      product.id,
      {
        id: product.id,
        is_active: false,
      },
    );

    if (!productUpdate || productUpdate.affected < 1) {
      throw new InternalServerErrorException(
        `Erro ao tentar excluir produto: ${product.name}`,
      );
    }
  }
}
