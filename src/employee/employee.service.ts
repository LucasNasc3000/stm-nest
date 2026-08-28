import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenPayloadDTO } from 'src/auth/dto/token-payload.dto';
import { HashingServiceProtocol } from 'src/auth/hashing/hashing.service';
import { UrlUuidDTO } from 'src/common/dto/url-uuid.dto';
import { EmployeeSituation } from 'src/common/enums/employee-situation.enum';
import { GeneralErrorType } from 'src/common/enums/general-error-type.enum';
import { Action, Resource } from 'src/common/enums/permissions.enum';
import { Role } from 'src/role/entities/role.entity';
import { RoleService } from 'src/role/role.service';
import { ErrorManagement } from 'src/utils/error.util';
import { DataSource, ILike, QueryRunner, Repository } from 'typeorm';
import { CreateEmployeeDTO } from './dto/create-employee.dto';
import { PaginationByBossDTO } from './dto/pagination-employee-boss.dto';
import { PaginationByRoleDTO } from './dto/pagination-employee-role.dto';
import { PaginationExEmployeesDTO } from './dto/pagination-exemployees.dto';
import { PaginationByNameDTO } from './dto/pagination-name.dto';
import { SearchByEmailDTO } from './dto/search-email-employee.dto';
import { UpdateEmployeeAdminDTO } from './dto/update-employee-admin.dto';
import { UpdateEmployeeDTO } from './dto/update-employee.dto';
import { Employee } from './entities/employee.entity';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private readonly roleService: RoleService,
    private readonly hashingService: HashingServiceProtocol,
    private readonly logger: Logger,
    private dataSource: DataSource,
  ) {}

  private async IsEmployeeVerify(email: string) {
    const findEmployee = await this.employeeRepository.findOne({
      where: {
        email,
      },
    });

    return findEmployee;
  }

  async Create(createEmployeeDTO: CreateEmployeeDTO) {
    const employeeExists = await this.IsEmployeeVerify(createEmployeeDTO.email);

    if (employeeExists) {
      throw new BadRequestException('Funcionário já existe');
    }

    const password_hash = await this.hashingService.Hash(
      createEmployeeDTO.currentPassword,
    );

    const findRole = await this.roleService.FindById(
      createEmployeeDTO.role.roleId,
    );

    if (!findRole) {
      throw new BadRequestException(
        `Cargo ${createEmployeeDTO.role.name} não encontrado`,
      );
    }

    const employeeCreateData = {
      email: createEmployeeDTO.email,
      name: createEmployeeDTO.name,
      password_hash,
      role: findRole,
      situation: EmployeeSituation.EMPLOYED,
      boss: createEmployeeDTO.boss || null,
      subordinates: createEmployeeDTO.subordinates || null,
    };

    const employeeCreate = this.employeeRepository.create(employeeCreateData);

    const newEmployee = await this.employeeRepository.save(employeeCreate);

    if (!employeeCreate || !newEmployee) {
      throw new InternalServerErrorException('Erro ao cadastrar funcionário');
    }

    const allowedData = {
      id: newEmployee.id,
      email: newEmployee.email,
      name: newEmployee.name,
      role: newEmployee.role,
      boss: newEmployee.boss,
    };

    return {
      ...allowedData,
    };
  }

  async UpdateSelf(
    updateEmployeeDTO: UpdateEmployeeDTO,
    tokenPayloadDTO: TokenPayloadDTO,
  ) {
    const allowedData = {
      email: updateEmployeeDTO.email,
      name: updateEmployeeDTO.name,
      password_hash: updateEmployeeDTO?.newPassword,
    };

    const findEmployeeById = await this.employeeRepository.findOne({
      where: {
        id: tokenPayloadDTO.sub,
      },
    });

    if (!findEmployeeById) {
      throw new NotFoundException('Funcionário não encontrado');
    }

    const passwordValidate = await this.hashingService.Compare(
      updateEmployeeDTO.currentPassword,
      findEmployeeById.password_hash,
    );

    if (!passwordValidate) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (updateEmployeeDTO?.newPassword) {
      const passwordHash = await this.hashingService.Hash(
        updateEmployeeDTO.newPassword,
      );

      allowedData.password_hash = passwordHash;
    }

    const employeeUpdate = await this.employeeRepository.preload({
      id: tokenPayloadDTO.sub,
      ...allowedData,
    });

    const employeeUpdated = await this.employeeRepository.save(employeeUpdate);

    if (!employeeUpdate || !employeeUpdated) {
      throw new InternalServerErrorException(
        'Erro ao tentar atualizar funcionário',
      );
    }

    return employeeUpdated;
  }

  async UpdateAdmin(
    employeeIdDTO: UrlUuidDTO,
    updateEmployeeAdminDTO: UpdateEmployeeAdminDTO,
    tokenPayloadDTO: TokenPayloadDTO,
  ) {
    const id = employeeIdDTO.id;

    const allowedData = {
      role: updateEmployeeAdminDTO.role,
      situation: updateEmployeeAdminDTO.situation,
    };

    const findEmployeeById = await this.employeeRepository.findOne({
      where: {
        id,
      },
      relations: {
        boss: true,
        role: {
          permissions: true,
        },
      },
      select: {
        boss: {
          id: true,
          email: true,
        },
      },
    });

    if (!findEmployeeById) {
      throw new NotFoundException('Funcionário não encontrado');
    }

    // Não deixa atualizar outros admins
    for (let i = 0; i < findEmployeeById.role.permissions.length; i++) {
      if (
        tokenPayloadDTO.sub !== id &&
        findEmployeeById.role.permissions[i].resource === Resource.EMPLOYEES
      ) {
        throw new ForbiddenException('Ação não permitida');
      }
    }

    // Não deixa atualizar funcionários de outros admins
    if (findEmployeeById.boss.id !== tokenPayloadDTO.sub) {
      throw new ForbiddenException('Ação não permitida');
    }

    const employeeUpdate = await this.employeeRepository.preload({
      id,
      ...allowedData,
    });

    const employeeUpdated = await this.employeeRepository.save(employeeUpdate);

    if (!employeeUpdate || !employeeUpdated) {
      throw new InternalServerErrorException(
        'Erro ao tentar atualizar dados de funcionário',
      );
    }

    return employeeUpdated;
  }

  async UpdateBoss(
    previousBossId: string,
    newBossId?: string,
    createEmployeeDTO?: CreateEmployeeDTO,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const findPreviousBoss = await queryRunner.manager.findOne(Employee, {
        where: {
          id: previousBossId,
        },
      });

      if (findPreviousBoss.role.name !== 'admin') {
        throw new BadRequestException(
          'Funcionário não possui cargo de administrador',
        );
      }

      const findNewBoss = await queryRunner.manager.findOne(Employee, {
        where: {
          id: newBossId,
        },
      });

      if (!findPreviousBoss || !findNewBoss) {
        throw new NotFoundException(
          'Administrador ou funcionário não encontrado',
        );
      }

      if (createEmployeeDTO) {
        const newBoss = await this.CreateNewBoss(
          createEmployeeDTO,
          queryRunner,
        );

        await this.UpdatePreviousEmployees(
          findPreviousBoss,
          newBoss,
          queryRunner,
        );
      }

      await this.UpdateBossPreviousEmployee(
        findPreviousBoss,
        findNewBoss,
        queryRunner,
      );

      const updatePreviousBoss = await queryRunner.manager.update(
        Employee,
        findPreviousBoss.id,
        {
          situation: EmployeeSituation.FIRED,
        },
      );

      if (!updatePreviousBoss || updatePreviousBoss.affected === 0) {
        throw new InternalServerErrorException(
          'Erro ao atualizar status do administrador anterior',
        );
      }

      const newBossData = await this.employeeRepository.findOne({
        where: {
          id: newBossId,
        },
      });

      if (!newBossData) {
        throw new NotFoundException(
          'Não foi possível encontrar novo adminstrador',
        );
      }

      return newBossData;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      ErrorManagement(error, GeneralErrorType.INTERNAL, {
        logger: 'Erro ao atualizar administrador:',
        queryFailedError: 'Erro ao atualizar dados de funcionários',
        internalServerError: 'Erro interno ao atualizar administrador',
        generalError:
          'Falha ao processar transação na atualização de administrador',
      });
    } finally {
      await queryRunner.release();
    }
  }

  async CreateNewBoss(
    createEmployeeDTO: CreateEmployeeDTO,
    queryRunner: QueryRunner,
  ) {
    const createNewBoss = queryRunner.manager.create(
      Employee,
      createEmployeeDTO,
    );

    const findAdminRole = await queryRunner.manager.findOne(Role, {
      where: {
        name: 'admin',
        permissions: {
          action: Action.UPDATE,
          resource: Resource.EMPLOYEES,
        },
      },
    });

    if (!findAdminRole) {
      throw new NotFoundException('Cargo de admin não encontrado');
    }

    createNewBoss.role = findAdminRole;

    const newBoss = await queryRunner.manager.save(Employee, createNewBoss);

    return newBoss;
  }

  async UpdateBossPreviousEmployee(
    previousBoss: Employee,
    newBoss: Employee,
    queryRunnerSub: QueryRunner,
  ) {
    const findAdminRole = await queryRunnerSub.manager.findOne(Role, {
      where: {
        name: 'admin',
        permissions: {
          action: Action.UPDATE,
          resource: Resource.EMPLOYEES,
        },
      },
    });

    if (!findAdminRole) {
      throw new NotFoundException('Cargo de administrador não encontrado');
    }

    const updateEmployeeRole = await queryRunnerSub.manager.update(
      Employee,
      newBoss.id,
      {
        role: findAdminRole,
      },
    );

    if (!updateEmployeeRole || updateEmployeeRole.affected === 0) {
      throw new InternalServerErrorException(
        'Erro ao atualizar cargo de funcionário',
      );
    }

    await this.UpdatePreviousEmployees(previousBoss, newBoss, queryRunnerSub);

    // await this.cacheManager.del(`role_permissions_${newRoleId}`);
  }

  private async UpdatePreviousEmployees(
    previousBoss: Employee,
    newBoss: Employee,
    queryRunnerSub: QueryRunner,
  ) {
    const findEmployeesPerBoss = await queryRunnerSub.manager.find(Employee, {
      where: {
        boss: previousBoss,
      },
    });

    if (findEmployeesPerBoss.length > 0) {
      for (const employee of findEmployeesPerBoss) {
        const updateBossFK = await queryRunnerSub.manager.update(
          Employee,
          employee.id,
          {
            boss: newBoss,
          },
        );

        if (!updateBossFK || updateBossFK.affected === 0) {
          throw new InternalServerErrorException(
            `Erro ao atualizar administrador do funcionário ${employee.email}`,
          );
        }
      }
    }
  }

  async FindSelf(tokenPayloadDTO: TokenPayloadDTO) {
    const employeeFindSelf = await this.employeeRepository.findOne({
      where: {
        id: tokenPayloadDTO.sub,
        situation: EmployeeSituation.EMPLOYED,
      },
    });

    if (!employeeFindSelf) {
      throw new NotFoundException('Funcionário não encontrado');
    }

    return employeeFindSelf;
  }

  async FindByEmail(emailDTO: SearchByEmailDTO) {
    const email = emailDTO.value;

    const employeeFindByEmail = await this.employeeRepository.findOneBy({
      email,
      situation: EmployeeSituation.EMPLOYED,
    });

    if (!employeeFindByEmail) {
      throw new NotFoundException('Funcionário não encontrado');
    }

    return employeeFindByEmail;
  }

  async FindById(id: string) {
    const employeeFindByEmail = await this.employeeRepository.findOneBy({
      id,
      situation: EmployeeSituation.EMPLOYED,
    });

    if (!employeeFindByEmail) {
      throw new NotFoundException('Funcionário não encontrado');
    }

    return employeeFindByEmail;
  }

  async FindByName(paginationByNameDTO: PaginationByNameDTO) {
    const { limit, offset, value } = paginationByNameDTO;

    const [employeeFindByName, total] =
      await this.employeeRepository.findAndCount({
        take: limit,
        skip: offset,
        order: {
          id: 'desc',
        },
        where: {
          name: ILike(`${value}%`),
          situation: EmployeeSituation.EMPLOYED,
        },
      });

    if (!employeeFindByName) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por funcionários',
      );
    }

    if (employeeFindByName.length < 1) {
      throw new NotFoundException('Funcionários não encontrados');
    }

    return [total, ...employeeFindByName];
  }

  async FindByRole(paginationByRoleDTO: PaginationByRoleDTO) {
    const { limit, offset, value } = paginationByRoleDTO;

    const [employeeFindByRole, total] =
      await this.employeeRepository.findAndCount({
        take: limit,
        skip: offset,
        order: {
          id: 'desc',
        },
        where: {
          role: {
            id: value,
          },
          situation: EmployeeSituation.EMPLOYED,
        },
      });

    if (!employeeFindByRole) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por funcionários',
      );
    }

    if (employeeFindByRole.length < 1) {
      throw new NotFoundException('Funcionários não encontrados');
    }

    return [total, ...employeeFindByRole];
  }

  async FindByBoss(paginationByBossDTO: PaginationByBossDTO) {
    const { limit, offset, value } = paginationByBossDTO;

    const [employeeFindByBoss, total] =
      await this.employeeRepository.findAndCount({
        take: limit,
        skip: offset,
        order: {
          id: 'desc',
        },
        where: {
          boss: {
            id: value,
          },
          situation: EmployeeSituation.EMPLOYED,
        },
      });

    if (!employeeFindByBoss) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por funcionários',
      );
    }

    return [total, ...employeeFindByBoss];
  }

  async FindExEmployees(paginationExEmployeesDTO?: PaginationExEmployeesDTO) {
    const { limit, offset } = paginationExEmployeesDTO;

    const [employeeFindByName, total] =
      await this.employeeRepository.findAndCount({
        take: limit,
        skip: offset,
        order: {
          id: 'desc',
        },
        where: {
          situation: EmployeeSituation.FIRED,
        },
      });

    if (!employeeFindByName) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por ex-funcionários',
      );
    }

    if (employeeFindByName.length < 1) {
      throw new NotFoundException('Ex-funcionários não encontrados');
    }

    return [total, ...employeeFindByName];
  }
}
