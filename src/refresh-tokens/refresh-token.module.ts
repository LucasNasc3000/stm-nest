import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import jwtConfig from 'src/auth/config/jwt.config';
import { Employee } from 'src/employee/entities/employee.entity';
import { RefreshTokenEmployee } from './entities/refresh-token-employee.entity';
import { RefreshTokensController } from './refresh-token.controller';
import { RefreshTokensService } from './refresh-token.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshTokenEmployee, Employee]),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  controllers: [RefreshTokensController],
  providers: [RefreshTokensService],
  exports: [RefreshTokensService],
})
export class RefreshTokensModule {}
