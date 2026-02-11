import { Role } from 'src/employee/entities/role.entity';

export class TokenPayloadDTO {
  sub: string;
  role: Role;
  email: string;
  iat: number;
  exp: number;
  aud: string;
  iss: string;
}
