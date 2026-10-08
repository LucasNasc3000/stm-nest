import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HashingServiceProtocol } from 'src/auth/hashing/hashing.service';
import { UpdateEmployeeDTO } from 'src/employee/dto/update-employee.dto';
import { Role } from 'src/role/entities/role.entity';
import { RoleService } from 'src/role/role.service';
import { DataSource, Repository } from 'typeorm';
import { EmployeeService } from '../../employee.service';
import { Employee } from '../../entities/employee.entity';
import {
  EmployeeGenericMockForInternalOperations,
  MakeEmployeeCreatePayloadMock,
  MakeEmployeeCreateReturnMock,
  MakeEmployeeCreateServiceReturnMock,
  MakeEmployeeSaveReturnMock,
  MakeEmployeeSearchMock,
} from '../mocks/employee.mock';
import { MakeTokenPayloadDTOMock } from '../mocks/token-payload-dto.mock';
import { ADMIN, ADMIN_ROLE, SELLER, SELLER_ROLE } from '../mocks/uuids.mock';

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
    const tokenPayloadDTOMock = MakeTokenPayloadDTOMock();

    const createEmployeeDTO = {
      email: 'testAdminLocal@mail.com',
      name: 'UsuarioTesteAdminLocal01',
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

      const hash =
        '$2b$10$Z.L6d2ydhs53krYMPhsVZe8Opcy8krSrkgkugAEy/G62nKg4zG9Xu';

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
    const tokenPayloadDTOMock = MakeTokenPayloadDTOMock();

    const updateEmployeeDTOWithoutPassword: UpdateEmployeeDTO = {
      email: 'testAdminLocal@mail.com',
      name: 'UsuarioTesteAdminLocal01',
      currentPassword: '12ABcd@#',
    };

    const updateEmployeeDTOWithPassword: UpdateEmployeeDTO = {
      email: 'testAdminLocal@mail.com',
      name: 'UsuarioTesteAdminLocal01',
      currentPassword: '12ABcd@#',
      newPassword: '34CDef$%',
    };

    const refinedDataForPreloadWithoutPassword = {
      email: 'testAdminLocal@mail.com',
      name: 'UsuarioTesteAdminLocal01',
    };

    const refinedDataForPreloadWithPassword = {
      email: 'testAdminLocal@mail.com',
      name: 'UsuarioTesteAdminLocal01',
      password_hash:
        '$2b$10$Z.L6d2ydhs53krYMPhsVZe8Opcy8krSrkgkugAEy/G62nKg4zG9Xu',
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
        .mockResolvedValue(
          '$2b$10$Z.L6d2ydhs53krYMPhsVZe8Opcy8krSrkgkugAEy/G62nKg4zG9Xu',
        );

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
});
