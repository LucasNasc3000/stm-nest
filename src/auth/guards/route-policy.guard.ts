import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Action, Resource } from 'src/common/enums/permissions.enum';
import { Role } from 'src/employee/entities/role.entity';
import { Repository } from 'typeorm';
import {
  CHECK_PERMISSION_KEY,
  REQUEST_TOKEN_PAYLOAD_KEY,
} from '../auth.constants';
import { RequiredPermission } from '../decorators/set-route-policy.decorator';

@Injectable()
export class RoutePolicyGuard implements CanActivate {
  constructor(
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

    const { role } = token;

    if (!role) {
      throw new UnauthorizedException('Somente funcionários');
    }

    const findRole = await this.roleRepository.findOne({
      where: {
        id: role.id,
      },
    });

    if (!findRole) {
      throw new UnauthorizedException('Cargo não encontrado');
    }

    const hasPermission = findRole.permissions.some(
      (p: { resource: Resource; action: Action }) =>
        p.resource === routePolicyRequired.resource &&
        p.action === routePolicyRequired.action,
    );

    if (!hasPermission) throw new ForbiddenException('Acesso negado');

    return true;
  }
}
