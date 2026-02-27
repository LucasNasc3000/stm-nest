import { forwardRef, Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { RoleModule } from 'src/role/role.module';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { Employee } from './entities/employee.entity';

@Module({
  controllers: [EmployeeController],
  providers: [EmployeeService, Logger],
  imports: [
    TypeOrmModule.forFeature([Employee]),
    RoleModule,
    forwardRef(() => AuthModule),
  ],
  exports: [EmployeeService, TypeOrmModule],
})
export class EmployeeModule {}
