import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import jwtConfig from 'src/auth/config/jwt.config';
import { EmployeeSituation } from 'src/common/enums/employee-situation.enum';
import { GeneralErrorType } from 'src/common/enums/general-error-type.enum';
import {
  JwtPayload,
  RefreshTokenPayload,
} from 'src/common/interfaces/jwt-payload.interface';
import { Employee } from 'src/employee/entities/employee.entity';
import { LogsService } from 'src/logs-register/log.service';
import { ErrorManagement } from 'src/utils/error.util';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { RefreshTokenEmployee } from './entities/refresh-token-employee.entity';

@Injectable()
export class RefreshTokensService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,

    @InjectRepository(RefreshTokenEmployee)
    private readonly RTEmployeeRepository: Repository<RefreshTokenEmployee>,

    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
    private readonly logsService: LogsService,
    private readonly logger: Logger,
    private dataSource: DataSource,
  ) {}

  async CreateEmployee(sub: Employee, queryRunnerSub?: QueryRunner) {
    const rtData = {
      is_valid: true,
      employee: sub,
    };

    const rtCreate = queryRunnerSub.manager.create(
      RefreshTokenEmployee,
      rtData,
    );

    const newRT = await queryRunnerSub.manager.save(
      RefreshTokenEmployee,
      rtCreate,
    );

    return {
      ...newRT,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async RevokeAllEmployee(sub: Employee, isLogout: boolean, tokenId?: string) {
    try {
      const findAllUserRT = await this.RTEmployeeRepository.find({
        where: {
          employee: {
            id: sub.id,
          },
        },
      });

      for (let i = 0; i < findAllUserRT.length; i++) {
        await this.RTEmployeeRepository.update(findAllUserRT[i].id, {
          is_valid: false,
        });
      }

      if (isLogout) return;

      // const dateObj = new Date();

      // const localDate = dateObj.toLocaleString('pt-br', {
      //   dateStyle: 'short',
      // });

      // const localHour = dateObj.toLocaleTimeString('pt-br', {
      //   hourCycle: 'h24',
      //   hour: '2-digit',
      //   minute: '2-digit',
      //   second: '2-digit',
      // });

      // const localDateReplace = localDate.replaceAll('/', '-');
      // const year = localDateReplace.slice(6, 10);
      // const month = localDateReplace.slice(3, 5);
      // const day = localDateReplace.slice(0, 2);

      // const hours = localHour.slice(0, 2);
      // const minutes = localHour.slice(3, 5);
      // const seconds = localHour.slice(6, 9);

      // const hourString = `${hours}:${minutes}:${seconds}`;

      // const alertData: RTAlertDTO = {
      //   email: sub.email,
      //   userId: sub.id,
      //   tokenId,
      //   occurredAt: `${day}/${month}/${year} - ${hourString}`,
      // };

      // await this.emailsService.SendRTAlertEmployees(alertData, true);
      // await this.emailsService.SendRTAlertEmployees(alertData, false);

      throw new Error('Acessos revogados, contate o suporte');
    } catch (error) {
      ErrorManagement(error, GeneralErrorType.UNAUTHORIZED, {
        logger: 'Erro no revokeAllEmployee',
        queryFailedError: 'Erro nos registros durante revogação',
        internalServerError: 'Erro interno ao revogar tokens de funcionário',
        generalError: 'Erro ao revogar tokens de funcionário',
      });
    }
  }

  async RefreshTokensEmployee(refreshToken: string) {
    const { sub, id } = await this.jwtService.verifyAsync(
      refreshToken,
      this.jwtConfiguration,
    );

    const findEmployee = await this.employeeRepository.findOne({
      where: {
        id: sub,
        situation: EmployeeSituation.EMPLOYED,
      },
    });

    if (!findEmployee) {
      // O Error vai pular para o Unauthorized no catch e a mensagem será esta
      throw new Error('Usuário não encontrado ou inativo');
    }

    const create = await this.CreateTokensEmployee(findEmployee, id);

    return create;
  }

  async CreateTokensEmployee(
    employeeData: Employee,
    refreshTokenIdIncoming: string,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let accessToken: string = '';
    let refreshToken: string = '';

    try {
      const doesEmployeeReallyExists = await queryRunner.manager.findOne(
        Employee,
        {
          where: {
            id: employeeData.id,
          },
          relations: {
            role: true,
          },
        },
      );

      if (!doesEmployeeReallyExists) {
        throw new UnauthorizedException('Funcionário não encontrado');
      }

      const [updateToken]: RefreshTokenEmployee[] =
        await queryRunner.manager.query(
          `
          UPDATE refresh_token_employee
          SET is_valid = false
          WHERE token_id = $1
            AND employee_id = $2
            AND is_valid = true
          RETURNING *
        `,
          [refreshTokenIdIncoming, doesEmployeeReallyExists.id],
        );

      if (!updateToken) {
        await this.RevokeAllEmployee(doesEmployeeReallyExists, false);

        throw new UnauthorizedException(
          'Refresh token inválido ou já utilizado',
        );
      }

      const create = await this.CreateEmployee(
        doesEmployeeReallyExists,
        queryRunner,
      );

      accessToken = await this.SignJwtAsync(
        doesEmployeeReallyExists.id,
        this.jwtConfiguration.jwtTtl,
        {
          email: doesEmployeeReallyExists.email,
          roleId: doesEmployeeReallyExists.role.id,
        },
      );

      refreshToken = await this.SignJwtAsync(
        doesEmployeeReallyExists.id,
        this.jwtConfiguration.jwtRefreshTtl,
        { id: create.token_id },
      );

      const dataForLog = {
        name: employeeData.name,
        email: employeeData.email,
        employee: employeeData,
      };

      await this.logsService.CreateLogEmployee(dataForLog, queryRunner);

      await queryRunner.commitTransaction();

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      ErrorManagement(error, GeneralErrorType.INTERNAL, {
        logger: 'Erro ao criar novo par de tokens',
        queryFailedError: 'Erro nos registros de re-autenticação',
        internalServerError: 'Erro interno ao criar novo par de tokens',
        generalError: 'Falha ao processar transação da re-autenticação',
      });
    } finally {
      await queryRunner.release();
    }
  }

  async SignJwtAsync(
    sub: string,
    expiresIn: number,
    payload?: JwtPayload | RefreshTokenPayload,
  ) {
    return await this.jwtService.signAsync(
      {
        sub,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }
}
