import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HashingServiceProtocol } from 'src/auth/hashing/hashing.service';
import { Role } from 'src/role/entities/role.entity';
import { RoleService } from 'src/role/role.service';
import { DataSource, Repository } from 'typeorm';
import { CreateEmployeeDTO } from '../dto/create-employee.dto';
import { EmployeeService } from '../employee.service';
import { Employee } from '../entities/employee.entity';
import {
  MakeEmployeeCreatePayloadMock,
  MakeEmployeeCreateReturnMock,
  MakeEmployeeCreateServiceReturnMock,
  MakeEmployeeSaveReturnMock,
  MakeEmployeeSearchMock,
} from './mocks/employee.mock';
import { MakeTokenPayloadDTOMock } from './mocks/token-payload-dto.mock';

describe('EmployeeService', () => {
  let employeeService: EmployeeService;
  let roleService: RoleService;
  // let dataSource: DataSource;
  let employeeRepository: Repository<Employee>;
  let hashingService: HashingServiceProtocol;

  // No módulo original é importado o RoleModule inteiro, não o service. Precisa disso aqui também?
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        {
          provide: getRepositoryToken(Employee),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: HashingServiceProtocol,
          useValue: {
            Hash: jest.fn(),
          },
        },
        {
          provide: RoleService,
          useValue: {
            FindById: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {},
        },
      ],
    }).compile();

    employeeService = module.get<EmployeeService>(EmployeeService);
    roleService = module.get<RoleService>(RoleService);
    // dataSource = module.get<DataSource>(DataSource);
    employeeRepository = module.get<Repository<Employee>>(
      getRepositoryToken(Employee),
    );
    hashingService = module.get<HashingServiceProtocol>(HashingServiceProtocol);
  });

  test('employeeService definition', () => {
    expect(employeeService).toBeDefined();
  });

  test('roleService definition', () => {
    expect(roleService).toBeDefined();
  });

  describe('create', () => {
    const employeeSearchMock = MakeEmployeeSearchMock();
    const tokenPayloadDTOMock = MakeTokenPayloadDTOMock();

    // Para testar o cadastro de funcionários é necessário passar um uuid mockado no segundo parâmetro.
    const employeeCreateMock = MakeEmployeeCreateReturnMock();
    const employeeCreateMockPayload = MakeEmployeeCreatePayloadMock();
    const employeeSaveMock = MakeEmployeeSaveReturnMock();
    const employeeCreateServiceReturn = MakeEmployeeCreateServiceReturnMock();

    // Testar com boss null e preenchido
    // Testar o case de erro 409, quando um funcionário com o mesmo email é encontrado
    test('conflict error when an employee with same email is found', async () => {
      jest
        .spyOn(employeeRepository, 'findOne')
        .mockResolvedValue(employeeSearchMock);
    });

    test('employee create', async () => {
      const createEmployeeDTO: CreateEmployeeDTO = {
        email: 'testAdminLocal@mail.com',
        name: 'UsuarioTesteAdminLocal01',
        currentPassword: '12ABcd@#',
        role: {
          roleId: 'addcbbe0-6932-457d-8fcb-a5cdef802cbe',
          name: 'admin',
        },
      };

      const hash =
        '$2b$10$Z.L6d2ydhs53krYMPhsVZe8Opcy8krSrkgkugAEy/G62nKg4zG9Xu';

      jest.spyOn(employeeService, 'FindByEmail').mockResolvedValue(null);

      // Testar com cargo não encontrado
      jest.spyOn(roleService, 'FindById').mockResolvedValue({
        id: 'addcbbe0-6932-457d-8fcb-a5cdef802cbe',
        name: 'admin',
      } as any as Role);

      jest.spyOn(hashingService, 'Hash').mockResolvedValue(hash);

      jest
        .spyOn(employeeRepository, 'create')
        .mockReturnValue(employeeCreateMock as never);

      jest
        .spyOn(employeeRepository, 'save')
        .mockResolvedValue(employeeSaveMock as never);

      const result = await employeeService.Create(
        tokenPayloadDTOMock,
        createEmployeeDTO,
      );

      expect(hashingService.Hash).toHaveBeenCalledWith(
        createEmployeeDTO.currentPassword,
      );

      expect(employeeRepository.create).toHaveBeenCalledWith(
        employeeCreateMockPayload,
      );

      expect(employeeRepository.save).toHaveBeenCalledWith(employeeCreateMock);

      expect(result).toEqual(employeeCreateServiceReturn);
    });
  });
});
