import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeModule } from 'src/employee/employee.module';
import { Product } from 'src/product/entities/product.entity';
import { Outflow } from './entities/outflow.entity';
import { OutflowController } from './outflow.controller';
import { OutflowService } from './outflow.service';

@Module({
  imports: [TypeOrmModule.forFeature([Outflow, Product]), EmployeeModule],
  controllers: [OutflowController],
  providers: [OutflowService],
})
export class OutflowModule {}
