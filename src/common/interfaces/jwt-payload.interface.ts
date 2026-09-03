export interface JwtPayload {
  email: string;
  roleId: string;
  adminId: string;
}

export interface RefreshTokenPayload {
  id: string;
}
