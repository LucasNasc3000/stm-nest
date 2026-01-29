import {
  BadRequestException,
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

    const dataSale = {
      date: createSaleDTO.date,
      hour: createSaleDTO.hour,
      clientName: createSaleDTO.clientName,
      phoneNumber: createSaleDTO.phoneNumber,
      address: createSaleDTO.address,
      saleItems: [],
    };

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

        if (item.quantity > itemExists.unities) {
          // Mandar email avisando da quantidade
          throw new BadRequestException(
            `Produto ${item.product} com estoque insuficiente de ${itemExists.unities} unidades`,
          );
        }

        const data = {
          quantity: item.quantity,
          price: item.price,
          product: itemExists,
        };

        const createSaleItems = queryRunner.manager.create(SaleItems, data);

        const newSaleItems = await queryRunner.manager.save(
          SaleItems,
          createSaleItems,
        );

        if (!createSaleItems || !newSaleItems) {
          throw new InternalServerErrorException(
            'Erro ao cadastrar itens do registro de venda',
          );
        }

        dataSale.saleItems.push(newSaleItems);
      }

      const createSale = queryRunner.manager.create(Sale, dataSale);

      const newSale = queryRunner.manager.save(Sale, createSale);

      if (!createSale || !newSale) {
        throw new InternalServerErrorException('Erro ao cadastrar nova venda');
      }

      await queryRunner.commitTransaction();

      return {
        ...newSale,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Erro ao criar registro de venda: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }
}
