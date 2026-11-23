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
  ADMIN_ROLE,
} from './admins-data';
import {
  EMPLOYEE,
  EMPLOYEE_EMAIL,
  EMPLOYEE_NAME,
  GENERAL_SUPPLIES_STOCK_CLERK,
  SELLER,
} from './employees-data';

export const DEFAULT_PASSWORD_HASH =
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
    password_hash: DEFAULT_PASSWORD_HASH,
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
    password_hash: DEFAULT_PASSWORD_HASH,
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
    password_hash: DEFAULT_PASSWORD_HASH,
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
      id: EMPLOYEE,
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

export function MakeFindSelfMock(overrides: Partial<Employee> = {}): Employee {
  return {
    id: ADMIN,
    email: ADMIN_EMAIL,
    name: ADMIN_NAME,
    situation: EmployeeSituation.EMPLOYED,
    createdAt: '2026-09-23T16:20:33.829Z',
    updatedAt: '2026-09-23T16:20:33.829Z',
    boss: null,
    ...overrides,
  } as Employee;
}

export function MakeFindSelfQuery(
  tokenPayloadDTOMock: TokenPayloadDTO,
  overrides: FindOneOptions<Employee> = {},
): FindOneOptions<Employee> {
  return {
    where: {
      id: tokenPayloadDTOMock.sub,
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
    ...overrides,
  } as FindOneOptions<Employee>;
}

export const EmployeeUpdateAdminRoleAndAdminFields = {
  id: EMPLOYEE,
  email: EMPLOYEE_EMAIL,
  name: EMPLOYEE_NAME,
  password_hash: DEFAULT_PASSWORD_HASH,
  situation: EmployeeSituation.EMPLOYED,
  createdAt: '2026-09-22T20:21:37.484Z',
  updatedAt: '2026-10-17T15:14:28.395Z',
  role: {
    id: GENERAL_SUPPLIES_STOCK_CLERK,
    name: 'general supplies stock clerk',
  },
  boss: {
    id: ADMIN,
    email: ADMIN_EMAIL,
    name: ADMIN_NAME,
    situation: EmployeeSituation.EMPLOYED,
    createdAt: '2026-03-04T16:05:29.578Z',
    updatedAt: '2026-10-16T23:26:09.501Z',
  },
} as any as Employee;

export const EmployeeUpdateAdminInternalSearch = {
  id: EMPLOYEE,
  email: EMPLOYEE_EMAIL,
  name: EMPLOYEE_NAME,
  password_hash: DEFAULT_PASSWORD_HASH,
  situation: EmployeeSituation.EMPLOYED,
  createdAt: '2026-09-23T16:20:33.829Z',
  updatedAt: '2026-10-16T23:26:09.501Z',
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

export const EmployeeAdminFindSelfMock = {
  id: ADMIN,
  email: ADMIN_EMAIL,
  name: ADMIN_NAME,
  password_hash: DEFAULT_PASSWORD_HASH,
  situation: EmployeeSituation.EMPLOYED,
  createdAt: '2026-09-23T16:20:33.829Z',
  updatedAt: '2026-09-23T16:20:33.829Z',
  boss: null,
} as any as Employee;

export const EmployeeFindSelfMock = {
  id: EMPLOYEE,
  email: EMPLOYEE_EMAIL,
  name: EMPLOYEE_NAME,
  password_hash: DEFAULT_PASSWORD_HASH,
  situation: EmployeeSituation.EMPLOYED,
  createdAt: '2026-09-23T16:20:33.829Z',
  updatedAt: '2026-09-23T16:20:33.829Z',
  boss: {
    id: ADMIN,
    email: ADMIN_EMAIL,
  },
} as any as Employee;

export const EmployeeAdminFindSelfMockResult = {
  id: ADMIN,
  email: ADMIN_EMAIL,
  name: ADMIN_NAME,
  password_hash: DEFAULT_PASSWORD_HASH,
  situation: EmployeeSituation.EMPLOYED,
  createdAt: '2026-09-23T16:20:33.829Z',
  updatedAt: '2026-09-23T16:20:33.829Z',
  boss: null,
} as any as Employee;

export const EmployeeFindSelfMockResult = {
  id: EMPLOYEE,
  email: EMPLOYEE_EMAIL,
  name: EMPLOYEE_NAME,
  password_hash: DEFAULT_PASSWORD_HASH,
  situation: EmployeeSituation.EMPLOYED,
  createdAt: '2026-09-23T16:20:33.829Z',
  updatedAt: '2026-09-23T16:20:33.829Z',
  boss: {
    id: ADMIN,
    email: ADMIN_EMAIL,
  },
} as any as Employee;

export const EmployeeGenericMockForInternalOperations = {
  id: ADMIN,
  email: ADMIN_EMAIL,
  name: ADMIN_NAME,
  password_hash: DEFAULT_PASSWORD_HASH,
  situation: EmployeeSituation.EMPLOYED,
  createdAt: '2026-09-23T16:20:33.829Z',
  updatedAt: '2026-09-23T16:20:33.829Z',
} as any as Employee;
