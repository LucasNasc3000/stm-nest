import { SetMetadata } from '@nestjs/common';
import { CHECK_PERMISSION_KEY } from '../auth.constants';

// Definimos a interface para garantir tipagem no controller
export interface RequiredPermission {
  resource: string;
  action: string;
}

export const SetRoutePolicy = (permission: RequiredPermission) =>
  SetMetadata(CHECK_PERMISSION_KEY, permission);
