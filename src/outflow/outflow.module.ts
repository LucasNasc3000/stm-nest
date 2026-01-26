import { Module } from '@nestjs/common';
import { EmployeeModule } from 'src/employee/employee.module';
import { OutflowController } from './outflow.controller';
import { OutflowService } from './outflow.service';

@Module({
  imports: [EmployeeModule],
  controllers: [OutflowController],
  providers: [OutflowService],
})
export class OutflowModule {}
