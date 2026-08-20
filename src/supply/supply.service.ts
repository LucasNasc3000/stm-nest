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
import { EmployeeService } from 'src/employee/employee.service';
import { Employee } from 'src/employee/entities/employee.entity';
import { ErrorManagement } from 'src/utils/error.util';
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
            isActive: true,
          },
        },
      );

      if (doesSupplyAlreadyExists) {
        throw new BadRequestException('Insumo já cadastrado');
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
        details: createSupplyDTO.details,
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

      ErrorManagement(error, GeneralErrorType.INTERNAL, {
        logger: 'Erro ao criar insumo:',
        queryFailedError: 'Erro ao cadastrar insumo',
        internalServerError: 'Erro interno ao criar insumo',
        generalError: 'Falha ao processar transação na criação de insumo',
      });
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

    const newSupplyHistory =
      await queryRunnerSub.manager.save(supplyHistoryCreate);

    return newSupplyHistory;
  }

  async Update(
    tokenPayloadDTO: TokenPayloadDTO,
    supplyId: string,
    updateSupplyRealtimeDTO: UpdateSupplyRealtimeDTO,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const updatesPerformed = [];

    try {
      const findEmployee = await queryRunner.manager.findOne(Employee, {
        where: {
          id: tokenPayloadDTO.sub,
        },
      });

      if (!findEmployee) {
        throw new NotFoundException('Funcionário não encontrado');
      }

      const doesSupplyReallyExists = await queryRunner.manager.findOne(
        SupplyRealTime,
        {
          where: {
            id: supplyId,
            isActive: true,
          },
        },
      );

      if (!doesSupplyReallyExists) {
        throw new NotFoundException('Insumo não encontrado');
      }

      const findThisSupplyHistory = await queryRunner.manager.find(
        SupplyHistory,
        {
          where: {
            supplyRealTime: {
              id: supplyId,
            },
          },
        },
      );

      if (findThisSupplyHistory.length < 1) {
        throw new NotFoundException(
          'Histórico do insumo não encontrado, não é possível editar',
        );
      }

      if (updateSupplyRealtimeDTO.quantity) {
        await this.UpdateQuantity(
          updateSupplyRealtimeDTO.quantity,
          doesSupplyReallyExists,
          queryRunner,
        );
      }

      const { reason, details, ...onlySupplyRealTimeData } =
        updateSupplyRealtimeDTO;

      const supplyUpdate = await queryRunner.manager.update(
        SupplyRealTime,
        doesSupplyReallyExists.id,
        {
          ...onlySupplyRealTimeData,
        },
      );

      if (!supplyUpdate || supplyUpdate.affected === 0) {
        throw new InternalServerErrorException(
          `Erro ao atualizar insumo: ${doesSupplyReallyExists.name}`,
        );
      }

      const recoverUpdatedSupplyDataTransaction =
        await queryRunner.manager.findOne(SupplyRealTime, {
          where: {
            id: doesSupplyReallyExists.id,
          },
        });

      const [lastInflow] = findThisSupplyHistory.map((i) => {
        const allSeq = [i.seq];
        return Math.max(...allSeq);
      });

      const [lastInflowData] = findThisSupplyHistory.map((i) => {
        if (Number(i.seq) === lastInflow) return i;
      });

      const {
        id,
        createdAt,
        updatedAt,
        totalWeight,
        quantity,
        ...extractedFromRecovery
      } = recoverUpdatedSupplyDataTransaction;

      const quantityDifference = quantity - doesSupplyReallyExists.quantity;

      const decimalQuantity = new Decimal(quantityDifference);

      const totalPrice = decimalQuantity
        .mul(extractedFromRecovery.price)
        .toString();

      const currentTotalWeight = new Decimal(
        doesSupplyReallyExists.totalWeight,
      );

      const decimalWeightPerUnit = new Decimal(
        doesSupplyReallyExists.weightPerUnit,
      );

      const totalWeightPerRegisterPre =
        decimalWeightPerUnit.mul(quantityDifference);

      const totalWeightPerRegister = currentTotalWeight
        .sub(totalWeightPerRegisterPre)
        .toString();

      const supplyHistoryData: CreateSupplyHistoryDTO = {
        ...extractedFromRecovery,
        quantity: updateSupplyRealtimeDTO.quantity,
        totalPrice,
        reason,
        details,
        totalWeightPerRegister,
        supplyRealTime: doesSupplyReallyExists,
        employee: findEmployee,
        expirationDate:
          updateSupplyRealtimeDTO.expirationDate ||
          lastInflowData.expirationDate,
      };

      const supplyHistory = await this.SaveSupplyHistory(
        supplyHistoryData,
        queryRunner,
      );

      await queryRunner.commitTransaction();

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

      const formattedCreatedAt = Formatter(recoverUpdatedSupplyData.createdAt);
      const formattedUpdatedAt = Formatter(recoverUpdatedSupplyData.updatedAt);

      for (let i = 0; i < Object.keys(updateSupplyRealtimeDTO).length; i++) {
        updatesPerformed.push(Object.keys(updateSupplyRealtimeDTO));
      }

      return {
        updatedSupplyRealTime: {
          ...recoverUpdatedSupplyData,
          formattedCreatedAt,
          formattedUpdatedAt,
        },
        updatedFields: updatesPerformed,
        supplyHistory,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      ErrorManagement(error, GeneralErrorType.INTERNAL, {
        logger: 'Erro ao atualizar insumo:',
        queryFailedError: 'Erro ao atualizar registro de insumo',
        internalServerError: 'Erro interno ao atualizar insumo',
        generalError: 'Falha ao processar transação na criação de insumo',
      });
    } finally {
      await queryRunner.release();
    }
  }

  async UpdatePrice(
    tokenPayloadDTO: TokenPayloadDTO,
    supplyId: string,
    updatePriceSupplyRealtimeDTO: UpdatePriceSupplyRealtimeDTO,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const findEmployee = await queryRunner.manager.findOne(Employee, {
        where: {
          id: tokenPayloadDTO.sub,
        },
      });

      if (!findEmployee) {
        throw new NotFoundException('Funcionário não encontrado');
      }

      const doesSupplyReallyExists = await queryRunner.manager.findOne(
        SupplyRealTime,
        {
          where: {
            id: supplyId,
            isActive: true,
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
          price: updatePriceSupplyRealtimeDTO.price,
        },
      );

      if (!supplyUpdate || supplyUpdate.affected === 0) {
        throw new InternalServerErrorException(
          `Erro ao tentar atualizar preço do insumo: ${doesSupplyReallyExists.name}`,
        );
      }

      await queryRunner.commitTransaction();

      const recoverUpdatedSupplyData =
        await this.supplyRealTimeRepository.findOne({
          where: {
            id: supplyId,
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

      const formattedCreatedAt = Formatter(recoverUpdatedSupplyData.createdAt);
      const formattedUpdatedAt = Formatter(recoverUpdatedSupplyData.updatedAt);

      return {
        ...recoverUpdatedSupplyData,
        formattedCreatedAt,
        formattedUpdatedAt,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      ErrorManagement(error, GeneralErrorType.INTERNAL, {
        logger: 'Erro ao atualizar preço de insumo:',
        queryFailedError: 'Erro ao atualizar preço de registro de insumo',
        internalServerError: 'Erro interno ao atualizar preço de insumo',
        generalError:
          'Falha ao processar transação na atualização de preço de insumo',
      });
    } finally {
      await queryRunner.release();
    }
  }

  private async UpdateQuantity(
    quantity: number,
    supplyRealTime: SupplyRealTime,
    queryRunner: QueryRunner,
  ) {
    const decimalWeightPerUnit = new Decimal(supplyRealTime.weightPerUnit);
    const currentTotalWeight = new Decimal(supplyRealTime.totalWeight);

    const quantityDifference = quantity - supplyRealTime.quantity;

    const subTotalWeight = decimalWeightPerUnit.mul(quantityDifference);

    const newTotalWeight = currentTotalWeight.sub(subTotalWeight).toString();

    const updateSupplyRealTime = await queryRunner.manager.update(
      SupplyRealTime,
      supplyRealTime.id,
      {
        totalWeight: newTotalWeight,
        quantity,
      },
    );

    if (!updateSupplyRealTime || updateSupplyRealTime.affected < 1) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao atualizar quantidade de insumo',
      );
    }
  }
}
