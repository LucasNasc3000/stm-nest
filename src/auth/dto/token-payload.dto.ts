export class TokenPayloadDTO {
  sub: string;
  roleId: string;
  email: string;
  iat: number;
  exp: number;
  aud: string;
  iss: string;
}
