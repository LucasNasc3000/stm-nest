import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from 'src/employee/entities/employee.entity';
import { JWTBlacklist } from 'src/jwt-blacklist/entities/jwt_blacklist.entity';
import { LogsModule } from 'src/logs-register/log.module';
import { RefreshTokensModule } from 'src/refresh-tokens/refresh-token.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import jwtConfig from './config/jwt.config';
import { BcryptService } from './hashing/bcrypt.service';
import { HashingServiceProtocol } from './hashing/hashing.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, JWTBlacklist]),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    LogsModule,
    RefreshTokensModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    Logger,
    {
      provide: HashingServiceProtocol,
      useClass: BcryptService,
    },
  ],
  exports: [HashingServiceProtocol, JwtModule, ConfigModule, AuthService],
})
export class AuthModule {}
