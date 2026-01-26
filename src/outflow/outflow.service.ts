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
import { EmployeeService } from 'src/employee/employee.service';
import { Employee } from 'src/employee/entities/employee.entity';
import { SupplyHistory } from 'src/supply/entities/supply-history.entity';
import { SupplyRealTime } from 'src/supply/entities/supply-realtime.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateOutflowDTO } from './dto/create-outflow.dto';
import { Outflow } from './entities/outflow.entity';

@Injectable()
export class OutflowService {
  constructor(
    @InjectRepository(Outflow)
    private readonly outflowRepository: Repository<Outflow>,

    @InjectRepository(SupplyHistory)
    private readonly supplyHistoryRepository: Repository<SupplyHistory>,

    private readonly employeesService: EmployeeService,
    private dataSource: DataSource,
    private readonly logger: Logger,
  ) {}

  async Create(
    createOutflowDTO: CreateOutflowDTO,
    tokenPayloadDTO: TokenPayloadDTO,
  ) {
    const findEmployee = await this.employeesService.FindById(
      tokenPayloadDTO.sub,
    );

    if (!findEmployee) {
      throw new UnauthorizedException('Funcionário não encontrado');
    }

    const supplyExists = await this.supplyHistoryRepository.findOne({
      where: {
        name: createOutflowDTO.name,
        category: createOutflowDTO.category,
      },
    });

    if (!supplyExists) {
      throw new NotFoundException(
        `Ocorreu um erro interno ou o insumo ${createOutflowDTO.name} não está cadastrado`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

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

      const doesSupplyReallyExists = await queryRunner.manager.findOne(
        SupplyRealTime,
        {
          where: {
            name: createOutflowDTO.name,
            category: createOutflowDTO.category,
          },
        },
      );

      if (!doesSupplyReallyExists) {
        throw new NotFoundException(
          `Ocorreu um erro interno ou o insumo ${createOutflowDTO.name} não está cadastrado`,
        );
      }

      const quantityCheck = this.QuantityCheck(
        doesSupplyReallyExists,
        createOutflowDTO,
      );

      if (quantityCheck === 'Stock_out') {
        throw new BadRequestException(
          `Estoque insuficiente para ${createOutflowDTO.name}`,
        );
      }

      if (quantityCheck === 'Low_stock') {
        // enviar e email e continuar transação
      }

      const quantityUpdate =
        doesSupplyReallyExists.quantity - createOutflowDTO.unities;

      const weighPerUnitDecimal = new Decimal(
        doesSupplyReallyExists.weightPerUnit,
      );

      const totalWeightDecimal = new Decimal(
        doesSupplyReallyExists.totalWeight,
      );

      const outflowTotalWeight = weighPerUnitDecimal.mul(
        createOutflowDTO.unities,
      );

      const updatedTotalWeight = totalWeightDecimal
        .sub(outflowTotalWeight)
        .toString();

      const updateSupply = await queryRunner.manager.update(
        SupplyRealTime,
        doesSupplyReallyExists.id,
        {
          quantity: quantityUpdate,
          totalWeight: updatedTotalWeight,
        },
      );

      if (!updateSupply || updateSupply.affected < 1) {
        throw new InternalServerErrorException(
          `Erro ao cadastrar saída do insumo ${createOutflowDTO.name}`,
        );
      }

      const data = {
        date: createOutflowDTO.date,
        hour: createOutflowDTO.hour,
        name: createOutflowDTO.name,
        category: createOutflowDTO.category,
        reason: createOutflowDTO.reason,
        unities: createOutflowDTO.unities,
        employee: doesEmployeeReallyExists,
        supplyRealTime: doesSupplyReallyExists,
      };

      const outflowCreate = queryRunner.manager.create(Outflow, data);

      const newOutflow = await queryRunner.manager.save(Outflow, outflowCreate);

      if (!outflowCreate || !newOutflow) {
        throw new InternalServerErrorException(
          `Erro ao cadastrar saída de ${createOutflowDTO.name}`,
        );
      }

      return {
        ...newOutflow,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Erro ao criar saída do insumo ${createOutflowDTO.name}: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  QuantityCheck(supply: SupplyRealTime, outflow: CreateOutflowDTO) {
    if (outflow.unities > supply.quantity) return 'Stock_out';

    const sub = supply.quantity - outflow.unities;

    if (sub > 0 && sub <= supply.lowStock) return 'Low_stock';
  }
}
