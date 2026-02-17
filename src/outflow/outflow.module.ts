import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeModule } from 'src/employee/employee.module';
import { Product } from 'src/product/entities/product.entity';
import { SupplyHistory } from 'src/supply/entities/supply-history.entity';
import { Outflow } from './entities/outflow.entity';
import { OutflowController } from './outflow.controller';
import { OutflowService } from './outflow.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Outflow, Product, SupplyHistory]),
    EmployeeModule,
  ],
  controllers: [OutflowController],
  providers: [OutflowService, Logger],
})
export class OutflowModule {}
