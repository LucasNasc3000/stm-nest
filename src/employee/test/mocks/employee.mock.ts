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
