import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenPayloadDTO } from 'src/auth/dto/token-payload.dto';
import { EmployeeService } from 'src/employee/employee.service';
import { Employee } from 'src/employee/entities/employee.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateSaleDTO } from './dto/create-sale.dto';
import { ProductIngredient } from './entities/product-ingredient.entity';
import { Product } from './entities/product.entity';
import { SaleItems } from './entities/sale-items.entity';
import { Sale } from './entities/sale.entity';

@Injectable()
export class SaleService {
  constructor(
    @InjectRepository(Sale)
    private readonly salesRepository: Repository<Sale>,
    private readonly employeesService: EmployeeService,
    private dataSource: DataSource,
    private readonly logger: Logger,
  ) {}

  async Create(tokenPayloadDTO: TokenPayloadDTO, createSaleDTO: CreateSaleDTO) {
    const findEmployee = await this.employeesService.FindById(
      tokenPayloadDTO.sub,
    );

    if (!findEmployee) {
      throw new UnauthorizedException('Funcionário não encontrado');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let newSaleItems: SaleItems;
    let findProductRecipe: ProductIngredient[];

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

      for (const item of createSaleDTO.saleItems) {
        const itemExists = await queryRunner.manager.findOne(Product, {
          where: {
            id: item.product,
          },
        });

        if (!itemExists) {
          throw new NotFoundException(`Produto ${item.product} não encontrado`);
        }

        const data = {
          quantity: item.quantity,
          price: item.price,
          product: itemExists,
        };

        const createSaleItems = queryRunner.manager.create(SaleItems, data);

        newSaleItems = await queryRunner.manager.save(
          SaleItems,
          createSaleItems,
        );

        if (!createSaleItems || !newSaleItems) {
          throw new InternalServerErrorException(
            'Erro ao cadastrar itens do registro de venda',
          );
        }

        const findProductRecipeInsideFor = await queryRunner.manager.find(
          ProductIngredient,
          {
            where: {
              product: {
                id: itemExists.id,
              },
            },
          },
        );

        findProductRecipe.push(...findProductRecipeInsideFor);

        if (
          !findProductRecipeInsideFor ||
          findProductRecipeInsideFor.length < 1
        ) {
          throw new NotFoundException(
            `Receita não criada para o produto ${itemExists.name}. Não é possível atualizar os insumos estoque`,
          );
        }
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Erro ao criar registro de venda: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }
}
