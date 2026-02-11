import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { Employee } from './entities/employee.entity';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';

@Module({
  controllers: [EmployeeController],
  providers: [EmployeeService],
  imports: [TypeOrmModule.forFeature([Employee, Role, Permission])],
  exports: [EmployeeService, TypeOrmModule],
})
export class EmployeeModule {}
