import {
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { EmployeeSituation } from 'src/common/enums/employee-situation.enum';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { Employee } from 'src/employee/entities/employee.entity';
import { JWTBlacklist } from 'src/jwt-blacklist/entities/jwt_blacklist.entity';
import { LogsService } from 'src/logs-register/log.service';
import { RefreshTokensService } from 'src/refresh-tokens/refresh-token.service';
import { Repository } from 'typeorm';
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
  ) {}

  async LoginEmployee(loginDTO: LoginDTO) {
    const findEmployee = await this.employeeRepository.findOneBy({
      email: loginDTO.email,
      situation: EmployeeSituation.EMPLOYED,
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
    const accessToken = await this.SignJwtAsync(
      employeeData.id,
      this.jwtConfiguration.jwtTtl,
      { email: employeeData.email, roleId: employeeData.role.id },
    );

    const refreshToken = await this.SignJwtAsync(
      employeeData.id,
      this.jwtConfiguration.jwtRefreshTtl,
    );

    const create = await this.refreshTokenService.CreateEmployee(employeeData);

    if (!create) {
      throw new InternalServerErrorException(
        'Erro ao criar registro de refresh token',
      );
    }

    const dataForLog = {
      email: employeeData.email,
      name: employeeData.name,
      employee: employeeData,
    };

    await this.logService.CreateLogEmployee(dataForLog);

    //if (!createLog) await this.emailsService.LogIssue('Funcionários');

    return {
      accessToken,
      refreshToken,
      email: employeeData.email,
      name: employeeData.name,
      id: employeeData.id,
    };
  }

  async SignJwtAsync(sub: string, expiresIn: number, payload?: JwtPayload) {
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

  async LogoutEmployee(logoutDto: LogoutDTO) {
    const jwtBlacklistData = {
      email: logoutDto.email,
      token: logoutDto.token,
    };

    const findEmployee = await this.employeeRepository.findOne({
      where: {
        email: logoutDto.email,
      },
    });

    await this.refreshTokenService.RevokeAllEmployee(findEmployee, true);

    const createLogout = this.jwtBlacklistRepository.create(jwtBlacklistData);

    await this.jwtBlacklistRepository.save(createLogout);

    return 'Logout criado com suceso';
  }
}
