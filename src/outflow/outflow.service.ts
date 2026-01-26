import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenPayloadDTO } from 'src/auth/dto/token-payload.dto';
import { EmployeeService } from 'src/employee/employee.service';
import { SupplyHistory } from 'src/supply/entities/supply-history.entity';
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
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Erro ao criar saída do insumo ${createOutflowDTO.name}: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
