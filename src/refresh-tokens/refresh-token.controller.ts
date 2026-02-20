import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { Public } from 'src/auth/decorators/set-metadata.decorator';
import { RefreshTokenGuard } from 'src/auth/guards/refresh-token.guard';
import { RefreshTokensService } from './refresh-token.service';

@Public()
@UseGuards(RefreshTokenGuard)
@Controller('refresh')
export class RefreshTokensController {
  constructor(private readonly refreshTokensService: RefreshTokensService) {}

  @Throttle({ refresh: { limit: 10, ttl: 60000 } })
  @Post('employee')
  async RefreshTokensEmployee(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = (req as any).refreshToken;
    const getRefreshToken =
      await this.refreshTokensService.RefreshTokensEmployee(token);

    res.cookie('accessToken', getRefreshToken.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 1000 * 60 * 20, // 20 minutos
      path: '/',
    });

    res.cookie('refreshToken', getRefreshToken.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24, // 1 dia
      path: '/refresh/employee',
    });

    return { success: true, message: 'Reutenticação concluída' };
  }
}
