// src/common/guards/csrf.guard.ts
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { randomBytes } from 'crypto';
import { Request, Response } from 'express';
import { SKIP_CSRF_KEY } from '../auth.constants';

@Injectable()
export class CsrfGuard implements CanActivate {
  private readonly logger = new Logger(CsrfGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // 1. Verifica se a rota tem @SkipCsrf()
    const skipCsrf = this.reflector.getAllAndOverride<boolean>(SKIP_CSRF_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipCsrf) {
      return true;
    }

    // 2. Métodos safe (GET, HEAD, OPTIONS) não precisam de CSRF
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (safeMethods.includes(request.method)) {
      // Se não tem cookie CSRF, cria um para futuras requisições
      if (!request.cookies['x-csrf-token']) {
        this.GenerateCsrfToken(response);
      }
      return true;
    }

    // 3. Pega tokens do cookie e header
    const cookieToken = request.cookies['x-csrf-token'];
    const headerToken = request.headers['x-csrf-token'] as string;

    // 4. Se não tem cookie, gera um e rejeita (client deve retry)
    if (!cookieToken) {
      this.GenerateCsrfToken(response);
      this.logger.warn('CSRF token missing in cookie. Generated new token.');
      throw new ForbiddenException(
        'CSRF token missing. A new token has been issued. Please retry your request.',
      );
    }

    // 5. Se não tem header, rejeita
    if (!headerToken) {
      this.logger.warn('CSRF token missing in header', {
        method: request.method,
        path: request.path,
        ip: request.ip,
      });
      throw new ForbiddenException(
        'CSRF token required in X-CSRF-Token header',
      );
    }

    // 6. Valida se cookie e header são iguais
    if (cookieToken !== headerToken) {
      this.logger.error('CSRF token mismatch', {
        method: request.method,
        path: request.path,
        ip: request.ip,
        hasCookie: !!cookieToken,
        hasHeader: !!headerToken,
      });
      throw new ForbiddenException('Invalid CSRF token');
    }

    // 7. Sucesso - rotaciona o token periodicamente (opcional)
    // Isso adiciona uma camada extra de segurança
    // if (this.ShouldRotateToken(cookieToken)) {
    //   this.GenerateCsrfToken(response);
    // }

    return true;
  }

  private GenerateCsrfToken(response: Response): string {
    const token = randomBytes(32).toString('hex');

    response.cookie('x-csrf-token', token, {
      httpOnly: false, // ⚠️ IMPORTANTE: precisa ser false para JS ler
      secure: process.env.NODE_ENV === 'production', // true em prod
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      path: '/',
    });

    this.logger.debug('Generated new CSRF token');
    return token;
  }

  // Rotaciona token a cada 4 horas (opcional, para segurança extra)
  // private ShouldRotateToken(token: string): boolean {
  //   // Você pode implementar lógica baseada em timestamp se quiser
  //   // Por simplicidade, vamos rotacionar aleatoriamente (5% de chance)
  //   return Math.random() < 0.05;
  // }
}
