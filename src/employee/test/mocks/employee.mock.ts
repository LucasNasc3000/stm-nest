import { EmployeeSituation } from 'src/common/enums/employee-situation.enum';
import { Employee } from 'src/employee/entities/employee.entity';
import { Role } from 'src/role/entities/role.entity';

// A chave boss pode ser alterada pelo override. Se não vier nada permanecerá null
// Como é uma busca, na qual os dados já estão cadastrados, boss será do tipo Employee, não string,
// como nos métodos de criação
export function MakeEmployeeSearchMock(
  overrides: Partial<Employee> = {},
  overridesRole: Partial<Role> = {},
): Employee {
  return {
    id: '4cb295bd-99cd-4ff4-a59d-f4936da89c70',
    email: 'testAdminLocal@mail.com',
    name: 'UsuarioTesteAdminLocal01',
    situation: EmployeeSituation.EMPLOYED,
    boss: null,
    ...overrides,
    role: {
      id: 'addcbbe0-6932-457d-8fcb-a5cdef802cbe',
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
    email: 'testAdminLocal@mail.com',
    name: 'UsuarioTesteAdminLocal01',
    password_hash:
      '$2b$10$Z.L6d2ydhs53krYMPhsVZe8Opcy8krSrkgkugAEy/G62nKg4zG9Xu',
    situation: EmployeeSituation.EMPLOYED,
    boss,
    subordinates: null,
    ...overrides,
    role: {
      id: 'addcbbe0-6932-457d-8fcb-a5cdef802cbe',
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
    email: 'testAdminLocal@mail.com',
    name: 'UsuarioTesteAdminLocal01',
    password_hash:
      '$2b$10$Z.L6d2ydhs53krYMPhsVZe8Opcy8krSrkgkugAEy/G62nKg4zG9Xu',
    situation: EmployeeSituation.EMPLOYED,
    boss,
    ...overrides,
    role: {
      id: 'addcbbe0-6932-457d-8fcb-a5cdef802cbe',
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
    id: '4cb295bd-99cd-4ff4-a59d-f4936da89c70',
    email: 'testAdminLocal@mail.com',
    name: 'UsuarioTesteAdminLocal01',
    password_hash:
      '$2b$10$Z.L6d2ydhs53krYMPhsVZe8Opcy8krSrkgkugAEy/G62nKg4zG9Xu',
    situation: EmployeeSituation.EMPLOYED,
    boss,
    createdAt: '2026-09-23T16:20:33.829Z',
    updatedAt: '2026-09-23T16:20:33.829Z',
    ...overrides,
    role: {
      id: 'addcbbe0-6932-457d-8fcb-a5cdef802cbe',
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
    id: '4cb295bd-99cd-4ff4-a59d-f4936da89c70',
    email: 'testAdminLocal@mail.com',
    name: 'UsuarioTesteAdminLocal01',
    boss,
    ...overrides,
    role: {
      id: 'addcbbe0-6932-457d-8fcb-a5cdef802cbe',
      name: 'admin',
      ...overridesRole,
    } as Role,
  } as Employee;
}

export const EmployeeUpdateAdminBossField = {
  id: 'd38911ab-ca49-4099-92fb-9d9e60cd4abb',
  email: 'guilherme@mail.com',
  name: 'Guilherme Souza',
  situation: 'empregado',
  createdAt: '2026-09-23T20:00:27.165Z',
  updatedAt: '2026-10-12T16:58:03.333Z',
  boss: {
    id: 'bcd7cf6b-5a5b-4bd6-a916-7d96c3d503a8',
    email: 'carlosFelipe@mail.com',
    name: 'Carlos Felipe',
    situation: EmployeeSituation.EMPLOYED,
    createdAt: '2026-10-09T23:25:16.572Z',
    updatedAt: '2026-10-09T23:25:16.572Z',
  },
} as any as Employee;

export const EmployeeUpdateAdminRoleField = {
  id: '81394758-ceed-4fe4-b038-268a7c261447',
  email: 'olivia@mail.com',
  name: 'Olivia Paula',
  situation: 'empregado',
  createdAt: '2026-09-22T20:21:37.484Z',
  updatedAt: '2026-10-12T17:05:59.713Z',
  role: {
    id: 'f5ebf2d1-7bc2-404b-8d0c-a5145d8abdad',
    name: 'estoquista geral insumos',
  },
} as any as Employee;

export const EmployeeGenericMockForInternalOperations = {
  id: '4cb295bd-99cd-4ff4-a59d-f4936da89c70',
  email: 'testAdminLocal@mail.com',
  name: 'UsuarioTesteAdminLocal01',
  password_hash: '$2b$10$Z.L6d2ydhs53krYMPhsVZe8Opcy8krSrkgkugAEy/G62nKg4zG9Xu',
  situation: EmployeeSituation.EMPLOYED,
  createdAt: '2026-03-04T16:05:29.578Z',
  updatedAt: '2026-09-04T17:05:55.058Z',
} as any as Employee;
