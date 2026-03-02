export class TokenPayloadDTO {
  sub: string;
  roleId: string;
  id?: string;
  email: string;
  iat: number;
  exp: number;
  aud: string;
  iss: string;
}
