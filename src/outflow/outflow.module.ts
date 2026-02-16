import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeModule } from 'src/employee/employee.module';
import { Product } from 'src/product/entities/product.entity';
import { SupplyModule } from 'src/supply/suppy.module';
import { Outflow } from './entities/outflow.entity';
import { OutflowController } from './outflow.controller';
import { OutflowService } from './outflow.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Outflow, Product]),
    EmployeeModule,
    SupplyModule,
  ],
  controllers: [OutflowController],
  providers: [OutflowService, Logger],
})
export class OutflowModule {}
