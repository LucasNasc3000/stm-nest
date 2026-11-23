import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenPayloadDTO } from 'src/auth/dto/token-payload.dto';
import { HashingServiceProtocol } from 'src/auth/hashing/hashing.service';
import { EmployeeSituation } from 'src/common/enums/employee-situation.enum';
import { Role } from 'src/role/entities/role.entity';
import { RoleService } from 'src/role/role.service';
import { ILike, Repository } from 'typeorm';
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
  ) {}

  async Create(
    tokenPayloadDTO: TokenPayloadDTO,
    createEmployeeDTO: CreateEmployeeDTO,
  ) {
    const searchEmailDTO: SearchByEmailDTO = {
      value: createEmployeeDTO.email,
    };

    const employeeExists = await this.FindByEmail(
      tokenPayloadDTO,
      searchEmailDTO,
      true,
    );

    if (employeeExists) {
      throw new ConflictException('Funcionário já existe');
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

    let employeeUpdate: Employee;

    if (updateEmployeeDTO.newPassword) {
      employeeUpdate = await this.employeeRepository.preload({
        id: tokenPayloadDTO.sub,
        ...allowedData,
      });
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password_hash, ...rest } = allowedData;

      employeeUpdate = await this.employeeRepository.preload({
        id: tokenPayloadDTO.sub,
        ...rest,
      });
    }

    const employeeUpdated = await this.employeeRepository.save(employeeUpdate);

    return employeeUpdated;
  }

  async UpdateAdmin(
    id: string,
    updateEmployeeAdminDTO: UpdateEmployeeAdminDTO,
    tokenPayloadDTO: TokenPayloadDTO,
  ) {
    const { boss, roleId, situation } = updateEmployeeAdminDTO;
    const preloadUpdateObject = {};

    const findEmployeeById = await this.employeeRepository.findOne({
      where: {
        id,
        boss: {
          id: tokenPayloadDTO.adminId,
        },
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

    let employeeUpdateRole: Role;

    if (roleId && typeof roleId === 'string') {
      employeeUpdateRole = await this.roleService.FindById(
        updateEmployeeAdminDTO.roleId,
      );

      if (!employeeUpdateRole) {
        throw new NotFoundException('Cargo não encontrado');
      }

      preloadUpdateObject['role'] = { id: updateEmployeeAdminDTO.roleId };
    }

    if (situation && typeof situation === 'string') {
      preloadUpdateObject['situation'] = updateEmployeeAdminDTO.situation;
    }

    if (boss && typeof boss === 'string') {
      const findBoss = await this.employeeRepository.findOne({
        where: {
          id: updateEmployeeAdminDTO.boss,
        },
      });

      if (!findBoss) {
        throw new NotFoundException('Admin não encontrado');
      }

      preloadUpdateObject['boss'] = { id: updateEmployeeAdminDTO.boss };
    }

    const employeeUpdate = await this.employeeRepository.preload({
      id,
      ...preloadUpdateObject,
    });

    const employeeUpdated = await this.employeeRepository.save(employeeUpdate);

    return employeeUpdated;
  }

  async FindSelf(tokenPayloadDTO: TokenPayloadDTO) {
    const employeeFindSelf = await this.employeeRepository.findOne({
      where: {
        id: tokenPayloadDTO.sub,
        situation: EmployeeSituation.EMPLOYED,
      },
      relations: {
        boss: true,
      },
      select: {
        boss: {
          id: true,
          email: true,
        },
      },
    });

    if (!employeeFindSelf) {
      throw new NotFoundException('Funcionário não encontrado');
    }

    return employeeFindSelf;
  }

  async FindByEmail(
    tokenPayloadDTO: TokenPayloadDTO,
    emailDTO: SearchByEmailDTO,
    forRegister: boolean,
  ) {
    const email = emailDTO.value;

    const employeeFindByEmail = await this.employeeRepository.findOne({
      where: {
        email,
        situation: EmployeeSituation.EMPLOYED,
        boss: {
          id: tokenPayloadDTO.adminId,
        },
      },
      relations: {
        boss: true,
        role: true,
      },
      select: {
        boss: {
          id: true,
          email: true,
        },
        role: {
          id: true,
          name: true,
        },
      },
    });

    if (!employeeFindByEmail && !forRegister) {
      throw new NotFoundException('Funcionário não encontrado');
    }

    return employeeFindByEmail;
  }

  async FindByIdInternal(id: string) {
    const employeeFindByEmail = await this.employeeRepository.findOneBy({
      id,
      situation: EmployeeSituation.EMPLOYED,
    });

    if (!employeeFindByEmail) {
      throw new NotFoundException('Funcionário não encontrado');
    }

    return employeeFindByEmail;
  }

  async FindByName(
    tokenPayloadDTO: TokenPayloadDTO,
    paginationByNameDTO: PaginationByNameDTO,
  ) {
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
          boss: {
            id: tokenPayloadDTO.adminId,
          },
        },
        relations: {
          boss: true,
          role: true,
        },
        select: {
          boss: {
            id: true,
            email: true,
          },
          role: {
            id: true,
            name: true,
          },
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

  async FindByRole(
    tokenPayloadDTO: TokenPayloadDTO,
    paginationByRoleDTO: PaginationByRoleDTO,
  ) {
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
            name: value,
          },
          boss: {
            id: tokenPayloadDTO.adminId,
          },
          situation: EmployeeSituation.EMPLOYED,
        },
        relations: {
          boss: true,
          role: true,
        },
        select: {
          boss: {
            id: true,
            email: true,
          },
          role: {
            id: true,
            name: true,
          },
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

  async FindByBoss(
    tokenPayloadDTO: TokenPayloadDTO,
    paginationByBossDTO: PaginationByBossDTO,
  ) {
    const { limit, offset } = paginationByBossDTO;

    const [employeeFindByBoss, total] =
      await this.employeeRepository.findAndCount({
        take: limit,
        skip: offset,
        order: {
          id: 'desc',
        },
        where: {
          boss: {
            id: tokenPayloadDTO.adminId,
          },
          situation: EmployeeSituation.EMPLOYED,
        },
        relations: {
          boss: true,
          role: true,
        },
        select: {
          boss: {
            id: true,
            email: true,
          },
          role: {
            id: true,
            name: true,
          },
        },
      });

    if (!employeeFindByBoss) {
      throw new InternalServerErrorException(
        'Erro desconhecido ao tentar pesquisar por funcionários',
      );
    }

    return [total, ...employeeFindByBoss];
  }

  async FindExEmployees(
    tokenPayloadDTO: TokenPayloadDTO,
    paginationExEmployeesDTO?: PaginationExEmployeesDTO,
  ) {
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
          boss: {
            id: tokenPayloadDTO.adminId,
          },
        },
        relations: {
          boss: true,
          role: true,
        },
        select: {
          boss: {
            id: true,
            email: true,
          },
          role: {
            id: true,
            name: true,
          },
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
