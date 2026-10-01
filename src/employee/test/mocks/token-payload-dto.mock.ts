import { TokenPayloadDTO } from 'src/auth/dto/token-payload.dto';

export function MakeTokenPayloadDTOMock(
  overrides: Partial<TokenPayloadDTO> = {},
): TokenPayloadDTO {
  return {
    sub: '4cb295bd-99cd-4ff4-a59d-f4936da89c70',
    id: '4cb295bd-99cd-4ff4-a59d-f4936da89c70',
    adminId: 'f937a3dc-f2cc-48f0-b2e7-17a0ecf432a6',
    roleId: 'addcbbe0-6932-457d-8fcb-a5cdef802cbe',
    email: 'testUser@mail.com',
    iat: 1790021223,
    exp: 1790022423,
    aud: 'http://localhost:3333',
    iss: 'http://localhost:3333',
    ...overrides,
  };
}
