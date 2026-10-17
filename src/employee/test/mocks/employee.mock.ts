import { TokenPayloadDTO } from 'src/auth/dto/token-payload.dto';
import { EmployeeSituation } from 'src/common/enums/employee-situation.enum';
import { Action, Resource } from 'src/common/enums/permissions.enum';
import { Employee } from 'src/employee/entities/employee.entity';
import { Role } from 'src/role/entities/role.entity';
import { FindOneOptions } from 'typeorm';
import {
  ADMIN,
  ADMIN_02,
  ADMIN_EMAIL,
  ADMIN_EMAIL_02,
  ADMIN_NAME,
  ADMIN_NAME_02,
  ADMIN_ROLE,
} from './admins-data';
import {
  EMPLOYEE,
  EMPLOYEE_EMAIL,
  EMPLOYEE_NAME,
  SELLER,
} from './employees-data';

export const DefaultPasswordHash =
  '$2b$10$Z.L6d2ydhs53krYMPhsVZe8Opcy8krSrkgkugAEy/G62nKg4zG9Xu';

// A chave boss pode ser alterada pelo override. Se não vier nada permanecerá null
// Como é uma busca, na qual os dados já estão cadastrados, boss será do tipo Employee, não string,
// como nos métodos de criação
export function MakeEmployeeSearchMock(
  overrides: Partial<Employee> = {},
  overridesRole: Partial<Role> = {},
): Employee {
  return {
    id: ADMIN,
    email: ADMIN_EMAIL,
    name: ADMIN_NAME,
    situation: EmployeeSituation.EMPLOYED,
    boss: null,
    ...overrides,
    role: {
      id: ADMIN_ROLE,
      name: 'admin',
      ...overridesRole,
    } as Role,
  } as Employee;
}

// Preencher subordinates
export function MakeEmployeeCreatePayloadMock(
  overrides: Partial<Omit<Employee, 'id'>> = {},
  overridesRole: Partial<Role> = {},
  boss: string | null,
): Partial<Omit<Employee, 'id'>> {
  return {
    email: ADMIN_EMAIL,
    name: ADMIN_NAME,
    password_hash: DefaultPasswordHash,
    situation: EmployeeSituation.EMPLOYED,
    boss,
    subordinates: null,
    ...overrides,
    role: {
      id: ADMIN_ROLE,
      name: 'admin',
      ...overridesRole,
    } as Role,
  } as Employee;
}

export function MakeEmployeeCreateReturnMock(
  overrides: Partial<Employee> = {},
  overridesRole: Partial<Role> = {},
  boss: string | null,
): Employee {
  return {
    email: ADMIN_EMAIL,
    name: ADMIN_NAME,
    password_hash: DefaultPasswordHash,
    situation: EmployeeSituation.EMPLOYED,
    boss,
    ...overrides,
    role: {
      id: ADMIN_ROLE,
      name: 'admin',
      ...overridesRole,
    } as Role,
  } as Employee;
}

export function MakeEmployeeSaveReturnMock(
  overrides: Partial<Employee> = {},
  overridesRole: Partial<Role> = {},
  boss: string | null,
): Employee {
  return {
    id: ADMIN,
    email: ADMIN_EMAIL,
    name: ADMIN_NAME,
    password_hash: DefaultPasswordHash,
    situation: EmployeeSituation.EMPLOYED,
    boss,
    createdAt: '2026-09-23T16:20:33.829Z',
    updatedAt: '2026-09-23T16:20:33.829Z',
    ...overrides,
    role: {
      id: ADMIN_ROLE,
      name: 'admin',
      ...overridesRole,
    } as Role,
  } as Employee;
}

export function MakeEmployeeCreateServiceReturnMock(
  overrides: Partial<Employee> = {},
  overridesRole: Partial<Role> = {},
  boss: string | null,
): Employee {
  return {
    id: ADMIN,
    email: ADMIN_EMAIL,
    name: ADMIN_NAME,
    boss,
    ...overrides,
    role: {
      id: ADMIN_ROLE,
      name: 'admin',
      ...overridesRole,
    } as Role,
  } as Employee;
}

export function MakeUpdateAdminFindOneQuery(
  tokenPayloadDTOMock: TokenPayloadDTO,
  overrides: FindOneOptions<Employee> = {},
): FindOneOptions<Employee> {
  return {
    where: {
      id: SELLER,
      boss: {
        id: tokenPayloadDTOMock.adminId,
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
    ...overrides,
  } as FindOneOptions<Employee>;
}

export const EmployeeUpdateAdminBossField = {
  id: EMPLOYEE,
  email: EMPLOYEE_NAME,
  name: EMPLOYEE_EMAIL,
  situation: EmployeeSituation.EMPLOYED,
  createdAt: '2026-09-23T16:20:33.829Z',
  updatedAt: '2026-09-23T16:20:33.829Z',
  boss: {
    id: ADMIN_02,
    email: ADMIN_EMAIL_02,
    name: ADMIN_NAME_02,
    situation: EmployeeSituation.EMPLOYED,
    createdAt: '2026-10-09T23:25:16.572Z',
    updatedAt: '2026-10-09T23:25:16.572Z',
  },
} as any as Employee;

export const EmployeeUpdateAdminRoleField = {
  id: '81394758-ceed-4fe4-b038-268a7c261447',
  email: 'olivia@mail.com',
  name: 'Olivia Paula',
  situation: EmployeeSituation.EMPLOYED,
  createdAt: '2026-09-23T16:20:33.829Z',
  updatedAt: '2026-09-23T16:20:33.829Z',
  role: {
    id: SELLER,
    name: 'seller',
  },
} as any as Employee;

export const EmployeeUpdateAdminInternalSearch = {
  id: '81394758-ceed-4fe4-b038-268a7c261447',
  email: 'olivia@mail.com',
  name: 'Olivia Paula',
  password_hash: DefaultPasswordHash,
  situation: EmployeeSituation.EMPLOYED,
  createdAt: '2026-09-23T16:20:33.829Z',
  updatedAt: '2026-09-23T16:20:33.829Z',
  boss: {
    id: ADMIN_02,
    email: ADMIN_EMAIL_02,
  },
  role: {
    id: SELLER,
    name: 'seller',
    permissions: [
      { action: Action.CREATE, resource: Resource.SALES },
      { action: Action.READ, resource: Resource.SALES },
      { action: Action.UPDATE, resource: Resource.SALES },
    ],
  },
} as any as Employee;

export const EmployeeGenericMockForInternalOperations = {
  id: ADMIN,
  email: ADMIN_EMAIL,
  name: ADMIN_NAME,
  password_hash: DefaultPasswordHash,
  situation: EmployeeSituation.EMPLOYED,
  createdAt: '2026-09-23T16:20:33.829Z',
  updatedAt: '2026-09-23T16:20:33.829Z',
} as any as Employee;
