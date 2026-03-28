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
import { EmployeeService } from 'src/employee/employee.service';
import { Employee } from 'src/employee/entities/employee.entity';
import { Formatter } from 'src/utils/format-timezone';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { CreateSupplyHistoryDTO } from './dto/create-supply-history.dto';
import { CreateSupplyDTO } from './dto/create-supply.dto';
import { UpdatePriceSupplyRealtimeDTO } from './dto/update-price-supply-realtime.dto';
import { UpdateSupplyRealtimeDTO } from './dto/update-supply-realtime.dto';
import { SupplyHistory } from './entities/supply-history.entity';
import { SupplyRealTime } from './entities/supply-realtime.entity';

@Injectable()
export class SupplyService {
  constructor(
    @InjectRepository(SupplyRealTime)
    private readonly supplyRealTimeRepository: Repository<SupplyRealTime>,
    private readonly employeesService: EmployeeService,
    private dataSource: DataSource,
    private readonly logger: Logger,
  ) {}

  async Create(
    createSupplyDTO: CreateSupplyDTO,
    tokenPayloadDTO: TokenPayloadDTO,
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

      const weightPerUnitSupplyRealTime = new Decimal(
        createSupplyDTO.weightPerUnit,
      );

      const totalWeightValue = weightPerUnitSupplyRealTime
        .mul(createSupplyDTO.quantity)
        .toString();

      const priceDecimal = new Decimal(createSupplyDTO.price);

      const totalPrice = priceDecimal.mul(createSupplyDTO.quantity).toString();

      const data = {
        category: createSupplyDTO.category,
        name: createSupplyDTO.name,
        quantity: createSupplyDTO.quantity,
        totalWeight: totalWeightValue,
        weightPerUnit: createSupplyDTO.weightPerUnit,
        supplier: createSupplyDTO.supplier,
        expirationDate: createSupplyDTO.expirationDate,
        employee: doesEmployeeReallyExists,
        lowStock: createSupplyDTO.lowStock,
        price: createSupplyDTO.price,
        totalPrice,
      };

      const doesSupplyAlreadyExists = await queryRunner.manager.findOne(
        SupplyRealTime,
        {
          where: {
            name: createSupplyDTO.name,
            is_active: true,
          },
          lock: { mode: 'pessimistic_write' },
        },
      );

      if (doesSupplyAlreadyExists) {
        const weightPerUnitDecimalSupplyExists = new Decimal(
          doesSupplyAlreadyExists.weightPerUnit,
        );

        const totalWeightDecimal = new Decimal(
          doesSupplyAlreadyExists.totalWeight,
        );

        const addToTotalWeight = weightPerUnitDecimalSupplyExists.mul(
          createSupplyDTO.quantity,
        );

        const newTotalWeight = totalWeightDecimal
          .add(addToTotalWeight)
          .toString();

        const updatedQuantity =
          doesSupplyAlreadyExists.quantity + createSupplyDTO.quantity;

        const currentTotalPrice = new Decimal(
          doesSupplyAlreadyExists.totalPrice,
        );

        const updatedTotalPrice = currentTotalPrice.add(totalPrice).toString();

        const supplyUpdate = await queryRunner.manager.update(
          SupplyRealTime,
          doesSupplyAlreadyExists.id,
          {
            totalWeight: newTotalWeight,
            quantity: updatedQuantity,
            totalPrice: updatedTotalPrice,
          },
        );

        if (!supplyUpdate || supplyUpdate.affected < 1) {
          throw new InternalServerErrorException(
            'Erro ao atualizar insumo existente',
          );
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { totalWeight, ...withoutTotalWeight } = data;

        const supplyHistoryData = {
          ...withoutTotalWeight,
          reason: createSupplyDTO.reason,
          totalWeightPerRegister: totalWeightValue,
          employee: doesEmployeeReallyExists,
          supplyRealTime: doesSupplyAlreadyExists,
        };

        await this.SaveSupplyHistory(supplyHistoryData, queryRunner);

        await queryRunner.commitTransaction();

        const recoverUpdatedSupplyData =
          await this.supplyRealTimeRepository.findOne({
            where: {
              id: doesSupplyAlreadyExists.id,
            },
            relations: {
              employee: true,
              supplyHistory: true,
            },
            select: {
              employee: {
                id: true,
                email: true,
              },
            },
          });

        const createdAt = Formatter(recoverUpdatedSupplyData.createdAt);
        const updatedAt = Formatter(recoverUpdatedSupplyData.updatedAt);

        return {
          message: 'Insumo já existente atualizado',
          supplyRealTime: {
            ...recoverUpdatedSupplyData,
            createdAt,
            updatedAt,
          },
        };
      }

      const supplyRealTimeCreate = queryRunner.manager.create(
        SupplyRealTime,
        data,
      );

      const newSupplyRealTime = await queryRunner.manager.save(
        SupplyRealTime,
        supplyRealTimeCreate,
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { totalWeight, ...withoutTotalWeight } = data;

      const supplyHistoryData = {
        ...withoutTotalWeight,
        reason: createSupplyDTO.reason,
        totalWeightPerRegister: totalWeightValue,
        employee: doesEmployeeReallyExists,
        supplyRealTime: newSupplyRealTime,
      };

      const newSupplyHistory = await this.SaveSupplyHistory(
        supplyHistoryData,
        queryRunner,
      );

      await queryRunner.commitTransaction();

      const updatedAt = Formatter(newSupplyRealTime.updatedAt);

      return {
        supplyRealTime: {
          ...newSupplyRealTime,
          updatedAt,
        },
        supplyHistory: newSupplyHistory,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      this.logger.error(`Erro ao criar insumo: ${error.message}`);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Falha ao processar transação na criação de insumo',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async SaveSupplyHistory(
    createSupplyHistoryDTO: CreateSupplyHistoryDTO,
    queryRunnerSub: QueryRunner,
  ) {
    const supplyHistoryCreate = queryRunnerSub.manager.create(
      SupplyHistory,
      createSupplyHistoryDTO,
    );

    await queryRunnerSub.manager.save(supplyHistoryCreate);
  }

  async Update(id: string, updateSupplyRealtimeDTO: UpdateSupplyRealtimeDTO) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const doesSupplyReallyExists = await queryRunner.manager.findOne(
        SupplyRealTime,
        {
          where: {
            id,
            is_active: true,
          },
        },
      );

      if (!doesSupplyReallyExists) {
        throw new NotFoundException('Insumo não encontrado');
      }

      const supplyUpdate = await queryRunner.manager.update(
        SupplyRealTime,
        doesSupplyReallyExists.id,
        {
          ...updateSupplyRealtimeDTO,
        },
      );

      const supplyUpdated = await queryRunner.manager.save(supplyUpdate);

      if (!supplyUpdate || !supplyUpdated) {
        throw new InternalServerErrorException(
          `Erro ao tentar atualizar insumo: ${findSupply.name}`,
        );
      }

      const recoverUpdatedSupplyData =
        await this.supplyRealTimeRepository.findOne({
          where: {
            id,
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

      const createdAt = Formatter(recoverUpdatedSupplyData.createdAt);
      const updatedAt = Formatter(recoverUpdatedSupplyData.updatedAt);

      return {
        ...recoverUpdatedSupplyData,
        createdAt,
        updatedAt,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      this.logger.error(`Erro ao atualizar insumo: ${error.message}`);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Falha ao processar transação na criação de insumo',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async UpdatePrice(
    id: string,
    updatePriceSupplyRealtimeDTO: UpdatePriceSupplyRealtimeDTO,
  ) {
    const findSupply = await this.supplyRealTimeRepository.findOne({
      where: {
        id,
        is_active: true,
      },
    });

    if (!findSupply) {
      throw new NotFoundException('Insumo não encontrado');
    }

    const supplyUpdate = await this.supplyRealTimeRepository.preload({
      id,
      price: updatePriceSupplyRealtimeDTO.price,
    });

    const supplyUpdated =
      await this.supplyRealTimeRepository.save(supplyUpdate);

    if (!supplyUpdate || !supplyUpdated) {
      throw new InternalServerErrorException(
        `Erro ao tentar atualizar preço do insumo: ${findSupply.name}`,
      );
    }

    const recoverUpdatedSupplyData =
      await this.supplyRealTimeRepository.findOne({
        where: {
          id,
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

    const createdAt = Formatter(recoverUpdatedSupplyData.createdAt);
    const updatedAt = Formatter(recoverUpdatedSupplyData.updatedAt);

    return {
      ...recoverUpdatedSupplyData,
      createdAt,
      updatedAt,
    };
  }
}
