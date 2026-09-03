export class TokenPayloadDTO {
  sub: string;
  adminId: string;
  roleId: string;
  id?: string;
  email: string;
  iat: number;
  exp: number;
  aud: string;
  iss: string;
}
