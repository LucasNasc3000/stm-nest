import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { SKIP_CSRF_KEY } from '../auth.constants';
import { doubleCsrfProtection } from '../config/csrf.config';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): Promise<boolean> {
    const skipCsrf = this.reflector.getAllAndOverride<boolean>(SKIP_CSRF_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipCsrf) {
      return Promise.resolve(true);
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    return new Promise((resolve, reject) => {
      doubleCsrfProtection(request, response, (err?: unknown) => {
        if (err) {
          // Padroniza o erro como ForbiddenException do Nest,
          // em vez de deixar o erro cru do Express subir.
          reject(
            new ForbiddenException(
              (err as Error)?.message ?? 'Token CSRF inválido ou ausente.',
            ),
          );
          return;
        }
        resolve(true);
      });
    });
  }
}
