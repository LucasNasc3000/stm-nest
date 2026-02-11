import {
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import jwtConfig from 'src/auth/config/jwt.config';
import { EmployeeSituation } from 'src/common/enums/employee-situation.enum';
import { Employee } from 'src/employee/entities/employee.entity';
import { Repository } from 'typeorm';
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
  ) {}

  async CreateEmployee(sub: Employee) {
    const rtData = {
      is_valid: true,
      employee: sub,
    };

    const rtCreate = this.RTEmployeeRepository.create(rtData);

    const newRT = await this.RTEmployeeRepository.save(rtCreate);

    return {
      ...newRT,
    };
  }

  async FindUsedRefreshTokenEmployee(refreshTokenId: string, sub: Employee) {
    const findUsedRefreshToken = await this.RTEmployeeRepository.findOne({
      where: {
        token_id: refreshTokenId,
        employee: {
          id: sub.id,
        },
      },
    });

    if (!findUsedRefreshToken) {
      throw new InternalServerErrorException(
        'Erro ao buscar refresh tokens relacionados ao funcionário',
      );
    }

    return findUsedRefreshToken;
  }

  async RefreshTokenVerifyEmployee(
    refreshTokenData: RefreshTokenEmployee,
    sub: Employee,
  ) {
    if (refreshTokenData.is_valid !== true) {
      return this.RevokeAllEmployee(sub, false, refreshTokenData.token_id);
    } else {
      return 'Token válido. Sem incidentes';
    }
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
      throw new UnauthorizedException({
        message: error.message,
        where: 'RevokeAll',
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

  async InvalidateRefreshToken(id: string) {
    const invalidate = await this.RTEmployeeRepository.update(id, {
      is_valid: false,
    });

    return invalidate;
  }

  async CreateTokensEmployee(
    employeeData: Employee,
    refreshTokenIdIncoming: string,
  ) {
    const findUsedRT = await this.FindUsedRefreshTokenEmployee(
      refreshTokenIdIncoming,
      employeeData,
    );

    await this.RefreshTokenVerifyEmployee(findUsedRT, employeeData);

    const invalidate = await this.InvalidateRefreshToken(findUsedRT.id);

    if (!invalidate) {
      throw new InternalServerErrorException(
        'Erro ao atualizar estado de refresh token',
      );
    }

    const create = await this.CreateEmployee(employeeData);

    if (!create) {
      throw new InternalServerErrorException(
        'Erro ao criar registro de refresh token',
      );
    }

    const accessToken = await this.SignJwtAsync<Partial<Employee>>(
      employeeData.id,
      this.jwtConfiguration.jwtTtl,
      { email: employeeData.email, role: employeeData.role },
    );

    const refreshToken = await this.SignJwtAsync<Partial<Employee>>(
      employeeData.id,
      this.jwtConfiguration.jwtRefreshTtl,
      { id: create.token_id },
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async SignJwtAsync<T>(sub: string, expiresIn: number, payload?: T) {
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
