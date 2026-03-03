import {
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { EmployeeSituation } from 'src/common/enums/employee-situation.enum';
import {
  JwtPayload,
  RefreshTokenPayload,
} from 'src/common/interfaces/jwt-payload.interface';
import { Employee } from 'src/employee/entities/employee.entity';
import { JWTBlacklist } from 'src/jwt-blacklist/entities/jwt_blacklist.entity';
import { LogsService } from 'src/logs-register/log.service';
import { RefreshTokensService } from 'src/refresh-tokens/refresh-token.service';
import { DataSource, Repository } from 'typeorm';
import jwtConfig from './config/jwt.config';
import { LoginDTO } from './dto/login.dto';
import { LogoutDTO } from './dto/logout.dto';
import { HashingServiceProtocol } from './hashing/hashing.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,

    @InjectRepository(JWTBlacklist)
    private readonly jwtBlacklistRepository: Repository<JWTBlacklist>,

    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
    private readonly hashingService: HashingServiceProtocol,
    private readonly logService: LogsService,
    private readonly refreshTokenService: RefreshTokensService,
    private readonly logger: Logger,
    private dataSource: DataSource,
  ) {}

  async LoginEmployee(loginDTO: LoginDTO) {
    const findEmployee = await this.employeeRepository.findOne({
      where: {
        email: loginDTO.email,
        situation: EmployeeSituation.EMPLOYED,
      },
      relations: {
        role: true,
      },
    });

    if (!findEmployee) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const passwordCompare = await this.hashingService.Compare(
      loginDTO.password,
      findEmployee.password_hash,
    );

    if (!passwordCompare) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const create = await this.CreateTokensEmployee(findEmployee);

    return create;
  }

  async CreateTokensEmployee(employeeData: Employee) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let accessToken: string = '';
    let refreshToken: string = '';

    try {
      const createRefreshToken = await this.refreshTokenService.CreateEmployee(
        employeeData,
        queryRunner,
      );

      accessToken = await this.SignJwtAsync(
        employeeData.id,
        this.jwtConfiguration.jwtTtl,
        { email: employeeData.email, roleId: employeeData.role.id },
      );

      refreshToken = await this.SignJwtAsync(
        employeeData.id,
        this.jwtConfiguration.jwtRefreshTtl,
        { id: createRefreshToken.token_id },
      );

      const dataForLog = {
        email: employeeData.email,
        name: employeeData.name,
        employee: employeeData,
      };

      await this.logService.CreateLogEmployee(dataForLog);

      await queryRunner.commitTransaction();

      return {
        accessToken,
        refreshToken,
        email: employeeData.email,
        name: employeeData.name,
        id: employeeData.id,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      this.logger.error(`Erro ao criar novo par de tokens: ${error.stack}`);

      // try {
      //   await this.emailsService.LogIssue('funcionário');
      // } catch (emailErr) {
      //   console.error(
      //     'Falha ao enviar e-mail de alerta de erro de autenticação',
      //     emailErr.message,
      //   );
      // }

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Falha ao processar transação da autenticação',
      );
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

  async LogoutEmployee(accessToken: string, logoutDto: LogoutDTO) {
    const jwtBlacklistData = {
      email: logoutDto.email,
      token: accessToken,
    };

    const findEmployee = await this.employeeRepository.findOne({
      where: {
        email: logoutDto.email,
      },
    });

    await this.refreshTokenService.RevokeAllEmployee(findEmployee, true);

    const createLogout = this.jwtBlacklistRepository.create(jwtBlacklistData);

    const newLogout = await this.jwtBlacklistRepository.save(createLogout);

    if (!createLogout || !newLogout) {
      throw new InternalServerErrorException('Erro ao criar logout');
    }

    return 'Logout criado com suceso';
  }
}
