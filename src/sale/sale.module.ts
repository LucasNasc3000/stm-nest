import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeModule } from 'src/employee/employee.module';
import { RoleModule } from 'src/role/role.module';
import { SaleItems } from './entities/sale-items.entity';
import { Sale } from './entities/sale.entity';
import { SaleController } from './sale.controller';
import { SaleService } from './sale.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sale, SaleItems]),
    EmployeeModule,
    RoleModule,
  ],
  controllers: [SaleController],
  providers: [SaleService, Logger],
})
export class SaleModule {}
