import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HashingServiceProtocol } from 'src/auth/hashing/hashing.service';
import { RoleService } from 'src/role/role.service';
import { DataSource, Repository } from 'typeorm';
import { CreateEmployeeDTO } from './dto/create-employee.dto';
import { EmployeeService } from './employee.service';
import { Employee } from './entities/employee.entity';

describe('EmployeeService', () => {
  let employeeService: EmployeeService;
  let roleService: RoleService;
  let dataSource: DataSource;
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
            hash: jest.fn(),
          },
        },
        {
          provide: RoleService,
          useValue: {},
        },
        {
          provide: DataSource,
          useValue: {},
        },
      ],
    }).compile();

    employeeService = module.get<EmployeeService>(EmployeeService);
    roleService = module.get<RoleService>(RoleService);
    dataSource = module.get<DataSource>(DataSource);
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
    // Testar com boss null e preenchido
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

      await employeeRepository.findOne(createEmployeeDTO);
    });
  });
});
