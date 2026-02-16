import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from './decorators/set-metadata.decorator';
import { LoginDTO } from './dto/login.dto';
import { LogoutDTO } from './dto/logout.dto';
import { TokenParam } from './params/token.param';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('employee')
  async LoginEmployee(
    @Res({ passthrough: true }) res: Response,
    @Body() loginDto: LoginDTO,
  ) {
    const createTokens = await this.authService.LoginEmployee(loginDto);

    res.cookie('accessToken', createTokens.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 20, // 20 minutos
      path: '/',
    });

    res.cookie('refreshToken', createTokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
      path: '/refresh/employee',
    });

    return {
      success: true,
      message: 'Autenticação concluída',
      email: createTokens.email,
      name: createTokens.name,
      id: createTokens.id,
    };
  }

  @Public()
  @Post('logout/employee')
  async LogoutEmployee(
    @TokenParam() accessToken: string,
    @Body() logoutDto: LogoutDTO,
  ) {
    await this.authService.LogoutEmployee(accessToken, logoutDto);
    return { success: true, message: 'Logout concluído' };
  }
}
