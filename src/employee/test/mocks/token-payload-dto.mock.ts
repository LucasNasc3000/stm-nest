import { TokenPayloadDTO } from 'src/auth/dto/token-payload.dto';
import { ADMIN, ADMIN_ROLE } from './employees-data';

export function MakeTokenPayloadDTOMock(
  overrides: Partial<TokenPayloadDTO> = {},
): TokenPayloadDTO {
  return {
    sub: ADMIN,
    id: 'f937a3dc-f2cc-48f0-b2e7-17a0ecf432a6',
    adminId: ADMIN,
    roleId: ADMIN_ROLE,
    email: 'testAdminLocal01@mail.com',
    iat: 1790021223,
    exp: 1790022423,
    aud: 'http://localhost:3333',
    iss: 'http://localhost:3333',
    ...overrides,
  };
}
