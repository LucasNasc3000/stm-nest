import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { Employee } from './entities/employee.entity';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';

@Module({
  controllers: [EmployeeController],
  providers: [EmployeeService],
  imports: [
    TypeOrmModule.forFeature([Employee, Role, Permission]),
    forwardRef(() => AuthModule),
  ],
  exports: [EmployeeService, TypeOrmModule],
})
export class EmployeeModule {}
