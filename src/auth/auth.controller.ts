import { Body, Controller, Post, Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from './decorators/set-metadata.decorator';
import { SkipCsrf } from './decorators/skip-csrf.decorator';
import { LoginDTO } from './dto/login.dto';
import { LogoutDTO } from './dto/logout.dto';
import { TokenParam } from './params/token.param';

@SkipCsrf()
@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SkipThrottle({ read: true, write: true })
  @Post()
  async LoginEmployee(
    @Res({ passthrough: true }) res: Response,
    @Body() loginDto: LoginDTO,
  ) {
    const createTokens = await this.authService.LoginEmployee(loginDto);

    res.cookie('accessToken', createTokens.loginData.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 1000 * 60 * 20, // 20 minutos
      path: '/',
    });

    res.cookie('refreshToken', createTokens.loginData.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24, // 1 dia
      path: '/refresh',
    });

    return {
      success: true,
      message: 'Autenticação concluída',
      email: createTokens.loginData.email,
      id: createTokens.loginData.id,
      permissions: createTokens.permissions,
    };
  }

  @SkipThrottle({ read: true, write: true })
  @Post('logout')
  async LogoutEmployee(
    @Res({ passthrough: true }) res: Response,
    @TokenParam() accessToken: string,
    @Body() logoutDto: LogoutDTO,
  ) {
    await this.authService.LogoutEmployee(accessToken, logoutDto);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.clearCookie('x-csrf-token');

    return { success: true, message: 'Logout concluído' };
  }
}
