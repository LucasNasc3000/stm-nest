import { Module } from '@nestjs/common';
import { EmployeeModule } from 'src/employee/employee.module';
import { OutflowService } from './outflow.service';

@Module({
  imports: [EmployeeModule],
  providers: [OutflowService],
})
export class OutflowModule {}
