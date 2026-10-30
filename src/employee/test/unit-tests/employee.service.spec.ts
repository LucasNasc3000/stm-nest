import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HashingServiceProtocol } from 'src/auth/hashing/hashing.service';
import { EmployeeSituation } from 'src/common/enums/employee-situation.enum';
import { UpdateEmployeeAdminDTO } from 'src/employee/dto/update-employee-admin.dto';
import { UpdateEmployeeDTO } from 'src/employee/dto/update-employee.dto';
import { Role } from 'src/role/entities/role.entity';
import { RoleService } from 'src/role/role.service';
import { DataSource, Repository } from 'typeorm';
import { EmployeeService } from '../../employee.service';
import { Employee } from '../../entities/employee.entity';
import {
  ADMIN,
  ADMIN_02,
  ADMIN_EMAIL,
  ADMIN_NAME,
  ADMIN_ROLE,
} from '../mocks/admins-data';
import {
  DEFAULT_PASSWORD_HASH,
  EmployeeGenericMockForInternalOperations,
  EmployeeUpdateAdminInternalSearch,
  EmployeeUpdateAdminRoleAndAdminFields,
  MakeEmployeeCreatePayloadMock,
  MakeEmployeeCreateReturnMock,
  MakeEmployeeCreateServiceReturnMock,
  MakeEmployeeSaveReturnMock,
  MakeEmployeeSearchMock,
  MakeUpdateAdminFindOneQuery,
} from '../mocks/employee.mock';
import {
  EMPLOYEE,
  GENERAL_SUPPLIES_STOCK_CLERK,
  SELLER,
  SELLER_ROLE,
} from '../mocks/employees-data';
import { MakeTokenPayloadDTOMock } from '../mocks/token-payload-dto.mock';

const tokenPayloadDTOMock = MakeTokenPayloadDTOMock();

describe('EmployeeService', () => {
  let employeeService: EmployeeService;
  let roleService: RoleService;
  // let dataSource: DataSource;
  let employeeRepository: Repository<Employee>;
  let hashingService: HashingServiceProtocol;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        {
          provide: getRepositoryToken(Employee),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            preload: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: HashingServiceProtocol,
          useValue: {
            Hash: jest.fn(),
            Compare: jest.fn(),
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

    const createEmployeeDTO = {
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      currentPassword: '12ABcd@#',
      boss: null,
      role: {
        roleId: ADMIN_ROLE,
        name: 'admin',
      },
    };

    // Testar com boss null e preenchido
    test('conflict error when an employee with same email is found', async () => {
      jest
        .spyOn(employeeService, 'FindByEmail')
        .mockResolvedValue(employeeSearchMock);

      await expect(
        employeeService.Create(tokenPayloadDTOMock, createEmployeeDTO),
      ).rejects.toThrow(ConflictException);

      expect(employeeService.FindByEmail).toHaveBeenCalledWith(
        tokenPayloadDTOMock,
        {
          value: createEmployeeDTO.email,
        },
        true,
      );
      expect(hashingService.Hash).not.toHaveBeenCalled();
      expect(roleService.FindById).not.toHaveBeenCalled();
      expect(employeeRepository.create).not.toHaveBeenCalled();
      expect(employeeRepository.save).not.toHaveBeenCalled();
    });

    test('bad request error when the role is not found', async () => {
      jest.spyOn(roleService, 'FindById').mockResolvedValue(null);

      await expect(
        employeeService.Create(tokenPayloadDTOMock, createEmployeeDTO),
      ).rejects.toThrow(BadRequestException);

      expect(employeeRepository.create).not.toHaveBeenCalled();
      expect(employeeRepository.save).not.toHaveBeenCalled();
    });

    // Apenas um cargo não-admin é usado como exemplo porque o propósito é apenas testar quando o campo boss
    // null e preenchido
    test.each([
      {
        roleId: ADMIN_ROLE,
        name: 'admin',
      },
      {
        roleId: SELLER_ROLE,
        name: 'seller',
      },
    ])('employee create ($name)', async ({ roleId, name }) => {
      const isAdmin = name === 'admin' ? null : ADMIN;
      const isAdminId = name === 'admin' ? null : SELLER;

      const hash = DEFAULT_PASSWORD_HASH;

      const tokenPayloadDTOMockForCreate = MakeTokenPayloadDTOMock({
        sub: isAdminId,
        roleId,
      });

      const employeeCreateMock = MakeEmployeeCreateReturnMock(
        {},
        { id: roleId, name: name },
        isAdmin,
      );

      const employeeSaveMock = MakeEmployeeSaveReturnMock(
        {},
        { id: roleId, name: name },
        isAdmin,
      );

      const employeeCreateMockPayload = MakeEmployeeCreatePayloadMock(
        {},
        { id: roleId, name: name },
        isAdmin,
      );

      const employeeCreateServiceReturn = MakeEmployeeCreateServiceReturnMock(
        {},
        { id: roleId, name: name },
        isAdmin,
      );

      jest.spyOn(employeeService, 'FindByEmail').mockResolvedValue(null);

      jest.spyOn(roleService, 'FindById').mockResolvedValue({
        id: roleId,
        name: name,
      } as any as Role);

      jest.spyOn(hashingService, 'Hash').mockResolvedValue(hash);

      jest
        .spyOn(employeeRepository, 'create')
        .mockReturnValue(employeeCreateMock as never);

      jest
        .spyOn(employeeRepository, 'save')
        .mockResolvedValue(employeeSaveMock as never);

      createEmployeeDTO.role.name = name;
      createEmployeeDTO.role.roleId = roleId;

      if (name !== 'admin') createEmployeeDTO.boss = ADMIN;

      const result = await employeeService.Create(
        tokenPayloadDTOMockForCreate,
        createEmployeeDTO,
      );

      expect(employeeService.FindByEmail).toHaveBeenCalledWith(
        tokenPayloadDTOMockForCreate,
        {
          value: createEmployeeDTO.email,
        },
        true,
      );

      expect(hashingService.Hash).toHaveBeenCalledWith(
        createEmployeeDTO.currentPassword,
      );
      expect(roleService.FindById).toHaveBeenCalledWith(
        createEmployeeDTO.role.roleId,
      );
      expect(employeeRepository.create).toHaveBeenCalledWith(
        employeeCreateMockPayload,
      );
      expect(employeeRepository.save).toHaveBeenCalledWith(employeeCreateMock);
      expect(result).toEqual(employeeCreateServiceReturn);
    });
  });

  describe('update self', () => {
    const updateEmployeeDTOWithoutPassword: UpdateEmployeeDTO = {
      email: ADMIN_NAME,
      name: ADMIN_NAME,
      currentPassword: '12ABcd@#',
    };

    const updateEmployeeDTOWithPassword: UpdateEmployeeDTO = {
      email: ADMIN_NAME,
      name: ADMIN_NAME,
      currentPassword: '12ABcd@#',
      newPassword: '34CDef$%',
    };

    const refinedDataForPreloadWithoutPassword = {
      email: ADMIN_NAME,
      name: ADMIN_NAME,
    };

    const refinedDataForPreloadWithPassword = {
      email: ADMIN_NAME,
      name: ADMIN_NAME,
      password_hash: DEFAULT_PASSWORD_HASH,
    };

    test('not found error when the employee is not found', async () => {
      jest.spyOn(employeeRepository, 'findOne').mockResolvedValue(null);

      await expect(
        employeeService.UpdateSelf(
          updateEmployeeDTOWithoutPassword,
          tokenPayloadDTOMock,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(employeeRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: tokenPayloadDTOMock.sub,
        },
      });
      expect(hashingService.Compare).not.toHaveBeenCalled();
      expect(hashingService.Hash).not.toHaveBeenCalled();
      expect(employeeRepository.preload).not.toHaveBeenCalled();
      expect(employeeRepository.save).not.toHaveBeenCalled();
    });

    test('unauthorized error when credenctials are wrong', async () => {
      jest
        .spyOn(employeeRepository, 'findOne')
        .mockResolvedValue(EmployeeGenericMockForInternalOperations);

      jest.spyOn(hashingService, 'Compare').mockResolvedValue(false);

      await expect(
        employeeService.UpdateSelf(
          updateEmployeeDTOWithoutPassword,
          tokenPayloadDTOMock,
        ),
      ).rejects.toThrow(UnauthorizedException);

      expect(employeeRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: tokenPayloadDTOMock.sub,
        },
      });
      expect(hashingService.Compare).toHaveBeenCalledWith(
        updateEmployeeDTOWithoutPassword.currentPassword,
        EmployeeGenericMockForInternalOperations.password_hash,
      );
      expect(hashingService.Hash).not.toHaveBeenCalled();
      expect(employeeRepository.preload).not.toHaveBeenCalled();
      expect(employeeRepository.save).not.toHaveBeenCalled();
    });

    test('self update without password', async () => {
      jest
        .spyOn(employeeRepository, 'findOne')
        .mockResolvedValue(EmployeeGenericMockForInternalOperations);

      jest.spyOn(hashingService, 'Compare').mockResolvedValue(true);

      jest.spyOn(employeeRepository, 'preload').mockResolvedValue({
        id: tokenPayloadDTOMock.sub,
        ...EmployeeGenericMockForInternalOperations,
      });

      jest
        .spyOn(employeeRepository, 'save')
        .mockResolvedValue(EmployeeGenericMockForInternalOperations);

      const result = await employeeService.UpdateSelf(
        updateEmployeeDTOWithoutPassword,
        tokenPayloadDTOMock,
      );

      expect(employeeRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: tokenPayloadDTOMock.sub,
        },
      });
      expect(hashingService.Compare).toHaveBeenCalledWith(
        updateEmployeeDTOWithoutPassword.currentPassword,
        EmployeeGenericMockForInternalOperations.password_hash,
      );
      expect(employeeRepository.preload).toHaveBeenCalledWith({
        id: tokenPayloadDTOMock.sub,
        ...refinedDataForPreloadWithoutPassword,
      });
      expect(employeeRepository.save).toHaveBeenCalledWith(
        EmployeeGenericMockForInternalOperations,
      );
      expect(result).toEqual(EmployeeGenericMockForInternalOperations);
    });

    test('self update with password', async () => {
      jest
        .spyOn(employeeRepository, 'findOne')
        .mockResolvedValue(EmployeeGenericMockForInternalOperations);

      jest.spyOn(hashingService, 'Compare').mockResolvedValue(true);

      jest
        .spyOn(hashingService, 'Hash')
        .mockResolvedValue(DEFAULT_PASSWORD_HASH);

      jest.spyOn(employeeRepository, 'preload').mockResolvedValue({
        id: tokenPayloadDTOMock.sub,
        ...EmployeeGenericMockForInternalOperations,
      });

      jest
        .spyOn(employeeRepository, 'save')
        .mockResolvedValue(EmployeeGenericMockForInternalOperations);

      const result = await employeeService.UpdateSelf(
        updateEmployeeDTOWithPassword,
        tokenPayloadDTOMock,
      );

      expect(employeeRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: tokenPayloadDTOMock.sub,
        },
      });
      expect(hashingService.Compare).toHaveBeenCalledWith(
        updateEmployeeDTOWithoutPassword.currentPassword,
        EmployeeGenericMockForInternalOperations.password_hash,
      );
      expect(hashingService.Hash).toHaveBeenCalledWith(
        updateEmployeeDTOWithPassword.newPassword,
      );
      expect(employeeRepository.preload).toHaveBeenCalledWith({
        id: tokenPayloadDTOMock.sub,
        ...refinedDataForPreloadWithPassword,
      });
      expect(employeeRepository.save).toHaveBeenCalledWith(
        EmployeeGenericMockForInternalOperations,
      );
      expect(result).toEqual(EmployeeGenericMockForInternalOperations);
    });
  });

  describe('update admin', () => {
    const updateAdminFindOneQuery =
      MakeUpdateAdminFindOneQuery(tokenPayloadDTOMock);

    const updateAdminOnlySituationField: UpdateEmployeeAdminDTO = {
      situation: EmployeeSituation.FIRED,
    };

    const udpateAdminBossAndRoleFields: UpdateEmployeeAdminDTO = {
      boss: ADMIN_02,
      roleId: GENERAL_SUPPLIES_STOCK_CLERK,
    };

    test('not found error when the employee is not found', async () => {
      jest.spyOn(employeeRepository, 'findOne').mockResolvedValue(null);

      await expect(
        employeeService.UpdateAdmin(
          EMPLOYEE,
          updateAdminOnlySituationField,
          tokenPayloadDTOMock,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(employeeRepository.findOne).toHaveBeenCalledWith(
        updateAdminFindOneQuery,
      );
      expect(employeeRepository.preload).not.toHaveBeenCalled();
      expect(employeeRepository.save).not.toHaveBeenCalled();
    });

    test('not found error when role is not found for role update', async () => {
      jest
        .spyOn(employeeRepository, 'findOne')
        .mockResolvedValue(EmployeeUpdateAdminInternalSearch);

      jest.spyOn(roleService, 'FindById').mockResolvedValue(null);

      await expect(
        employeeService.UpdateAdmin(
          EMPLOYEE,
          udpateAdminBossAndRoleFields,
          tokenPayloadDTOMock,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(employeeRepository.findOne).toHaveBeenCalledWith(
        updateAdminFindOneQuery,
      );
      expect(roleService.FindById).toHaveBeenCalledWith(
        udpateAdminBossAndRoleFields.roleId,
      );
      expect(employeeRepository.preload).not.toHaveBeenCalled();
      expect(employeeRepository.save).not.toHaveBeenCalled();
    });

    test('not found error when admin/boss is not found for admin/boss update', async () => {
      jest
        .spyOn(employeeRepository, 'findOne')
        .mockResolvedValue(EmployeeUpdateAdminInternalSearch);

      jest.spyOn(employeeRepository, 'findOne').mockResolvedValue(null);

      await expect(
        employeeService.UpdateAdmin(
          EMPLOYEE,
          udpateAdminBossAndRoleFields,
          tokenPayloadDTOMock,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(employeeRepository.findOne).toHaveBeenCalledWith(
        updateAdminFindOneQuery,
      );
      expect(employeeRepository.preload).not.toHaveBeenCalled();
      expect(employeeRepository.save).not.toHaveBeenCalled();
    });

    test('update of situation field only', async () => {
      jest
        .spyOn(employeeRepository, 'findOne')
        .mockResolvedValue(EmployeeUpdateAdminInternalSearch);

      jest.spyOn(employeeRepository, 'preload').mockResolvedValue({
        id: EMPLOYEE,
        ...EmployeeGenericMockForInternalOperations,
      });

      jest
        .spyOn(employeeRepository, 'save')
        .mockResolvedValue(EmployeeGenericMockForInternalOperations);

      const result = await employeeService.UpdateAdmin(
        EMPLOYEE,
        updateAdminOnlySituationField,
        tokenPayloadDTOMock,
      );

      expect(employeeRepository.findOne).toHaveBeenCalledWith(
        updateAdminFindOneQuery,
      );
      expect(employeeRepository.preload).toHaveBeenCalledWith({
        id: EMPLOYEE,
        ...updateAdminOnlySituationField,
      });
      expect(employeeRepository.save).toHaveBeenCalledWith(
        EmployeeGenericMockForInternalOperations,
      );
      expect(result).toEqual(EmployeeGenericMockForInternalOperations);
    });

    test('update of role and boss/admin fields', async () => {
      const preloadObject = {
        boss: {
          id: udpateAdminBossAndRoleFields.boss,
        },
        role: {
          id: udpateAdminBossAndRoleFields.roleId,
        },
      };

      jest
        .spyOn(employeeRepository, 'findOne')
        .mockResolvedValue(EmployeeUpdateAdminInternalSearch);

      jest.spyOn(roleService, 'FindById').mockResolvedValue({
        id: GENERAL_SUPPLIES_STOCK_CLERK,
        name: 'general supplies stock clerk',
      } as any as Role);

      jest
        .spyOn(employeeRepository, 'findOne')
        .mockResolvedValue(EmployeeGenericMockForInternalOperations);

      jest.spyOn(employeeRepository, 'preload').mockResolvedValue({
        id: EMPLOYEE,
        ...EmployeeGenericMockForInternalOperations,
      });

      jest
        .spyOn(employeeRepository, 'save')
        .mockResolvedValue(EmployeeUpdateAdminRoleAndAdminFields);

      const result = await employeeService.UpdateAdmin(
        EMPLOYEE,
        udpateAdminBossAndRoleFields,
        tokenPayloadDTOMock,
      );

      expect(employeeRepository.findOne).toHaveBeenCalledWith(
        updateAdminFindOneQuery,
      );
      expect(roleService.FindById).toHaveBeenCalledWith(
        udpateAdminBossAndRoleFields.roleId,
      );
      expect(employeeRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: udpateAdminBossAndRoleFields.boss,
        },
      });
      expect(employeeRepository.preload).toHaveBeenCalledWith({
        id: EMPLOYEE,
        ...preloadObject,
      });
      expect(employeeRepository.save).toHaveBeenCalledWith(
        EmployeeGenericMockForInternalOperations,
      );
      expect(result).toEqual(EmployeeUpdateAdminRoleAndAdminFields);
    });
  });
});
