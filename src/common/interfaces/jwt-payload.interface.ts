export interface JwtPayload {
  email: string;
  roleId: string;
}

export interface RefreshTokenPayload {
  id: string;
}
