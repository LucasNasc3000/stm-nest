import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from 'src/employee/entities/employee.entity';
import { RefreshTokenEmployee } from './entities/refresh-token-employee.entity';
import { RefreshTokensController } from './refresh-token.controller';
import { RefreshTokensService } from './refresh-token.service';

@Module({
  imports: [TypeOrmModule.forFeature([RefreshTokenEmployee, Employee])],
  controllers: [RefreshTokensController],
  providers: [RefreshTokensService],
  exports: [RefreshTokensService],
})
export class RefreshTokensModule {}
