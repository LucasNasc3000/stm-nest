import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenPayloadDTO } from 'src/auth/dto/token-payload.dto';
import { HashingServiceProtocol } from 'src/auth/hashing/hashing.service';
import { UrlUuidDTO } from 'src/common/dto/url-uuid.dto';
import { EmployeeSituation } from 'src/common/enums/employee-situation.enum';
import { Resource } from 'src/common/enums/permissions.enum';
import { Like, Repository } from 'typeorm';
import { CreateEmployeeDTO } from './dto/create-employee.dto';
import { CreateRoleDTO } from './dto/create-role.dto';
import { PaginationByRoleDTO } from './dto/pagination-employee-role.dto';
import { PaginationExEmployeesDTO } from './dto/pagination-exemployees.dto';
import { PaginationByNameDTO } from './dto/pagination-name.dto';
import { SearchByEmailDTO } from './dto/search-email-employee.dto';
import { UpdateEmployeeAdminDTO } from './dto/update-employee-admin.dto';
import { UpdateEmployeeDTO } from './dto/update-employee.dto';
import { Employee } from './entities/employee.entity';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,

    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly hashingService: HashingServiceProtocol,
  ) {}

  async CreateRole(createRoleDTO: CreateRoleDTO) {
    const permissions: Permission[] = [];

    const createRole = this.roleRepository.create(createRoleDTO);

    const newRole = await this.roleRepository.save(createRole);

    for (const permission of createRoleDTO.permissions) {
      const permissionData = {
        action: permission.action,
        resource: permission.resource,
        role: newRole,
      };

      const createPermission = this.permissionRepository.create(permissionData);

      permissions.push(createPermission);
    }

    const newPermissions = await this.permissionRepository.save(permissions);

    return {
      role: newRole,
      rolePermissions: newPermissions,
    };
  }

  async Create(createEmployeeDTO: CreateEmployeeDTO) {
    const password_hash = await this.hashingService.Hash(
      createEmployeeDTO.password,
    );

    const findRole = await this.roleRepository.findOne({
      where: {
        id: createEmployeeDTO.role.roleId,
      },
    });

    if (!findRole) {
      throw new BadRequestException(
        `Cargo ${createEmployeeDTO.role.name} não encontrado`,
      );
    }

    const employeeCreateData = {
      cpf: createEmployeeDTO.cpf,
      email: createEmployeeDTO.email,
      name: createEmployeeDTO.name,
      password_hash,
      role: findRole,
      situation: createEmployeeDTO.situation,
      boss: createEmployeeDTO.boss,
      subordinates: createEmployeeDTO.subordinates,
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
    employeeIdDTO: UrlUuidDTO,
    updateEmployeeDTO: UpdateEmployeeDTO,
    tokenPayloadDTO: TokenPayloadDTO,
  ) {
    const id = employeeIdDTO.id;

    const allowedData = {
      email: updateEmployeeDTO.email,
      name: updateEmployeeDTO.name,
      password_hash: updateEmployeeDTO.password,
    };

    if (id !== tokenPayloadDTO.sub) {
      throw new ForbiddenException('Ação não permitida');
    }

    if (updateEmployeeDTO?.password) {
      const passwordHash = await this.hashingService.Hash(
        updateEmployeeDTO.password,
      );

      allowedData.password_hash = passwordHash;
    }

    const findEmployeeById = await this.employeeRepository.findOne({
      where: {
        id,
      },
    });

    if (!findEmployeeById) {
      throw new NotFoundException('Funcionário não encontrado');
    }

    const employeeUpdate = await this.employeeRepository.preload({
      id,
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
      email: updateEmployeeAdminDTO.email,
      name: updateEmployeeAdminDTO.name,
      password_hash: updateEmployeeAdminDTO.password,
      role: updateEmployeeAdminDTO.role,
      situation: updateEmployeeAdminDTO.situation,
    };

    const findEmployeeById = await this.employeeRepository.findOne({
      where: {
        id,
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

  async FindByEmail(emailDTO: SearchByEmailDTO) {
    const email = emailDTO.email;

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
          name: Like(`${value}%`),
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
          role: value,
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
