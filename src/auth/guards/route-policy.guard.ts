import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Request } from 'express';
import { Action, Resource } from 'src/common/enums/permissions.enum';
import { Permission } from 'src/role/entities/permission.entity';
import { Role } from 'src/role/entities/role.entity';
import { Repository } from 'typeorm';
import {
  CHECK_PERMISSION_KEY,
  REQUEST_TOKEN_PAYLOAD_KEY,
} from '../auth.constants';
import { RequiredPermission } from '../decorators/set-route-policy.decorator';

@Injectable()
export class RoutePolicyGuard implements CanActivate {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const routePolicyRequired = this.reflector.get<
      RequiredPermission | undefined
    >(CHECK_PERMISSION_KEY, context.getHandler());

    // Se o controller ou método não tiver o permissões configuradas a request passa daqui
    if (!routePolicyRequired) return true;

    const token = request[REQUEST_TOKEN_PAYLOAD_KEY];

    if (!token) {
      throw new UnauthorizedException('Usuário não logado');
    }

    const { roleId } = token;

    if (!roleId) {
      throw new UnauthorizedException('Somente funcionários');
    }

    const checkPermissions = await this.GetPermissionsWithCache(roleId);

    const hasPermission = checkPermissions.some(
      (p: { resource: Resource; action: Action }) =>
        p.resource === routePolicyRequired.resource &&
        p.action === routePolicyRequired.action,
    );

    if (!hasPermission)
      throw new ForbiddenException(
        `Acesso negado: permissão de ${routePolicyRequired.action} necessária para o recurso ${routePolicyRequired.resource}`,
      );

    return true;
  }

  private async GetPermissionsWithCache(roleId: string) {
    const cacheKey = `role_permissions_${roleId}`;

    const cached = await this.cacheManager.get<Permission[]>(cacheKey);

    if (cached) return cached;

    const role = await this.roleRepository.findOne({
      where: {
        id: roleId,
      },
    });

    if (!role) {
      throw new UnauthorizedException('Cargo não encontrado');
    }

    if (role.permissions.length < 1) {
      throw new UnauthorizedException('Cargo sem permissões definidas');
    }

    const { permissions } = role;

    await this.cacheManager.set(cacheKey, permissions);

    return permissions;
  }
}
