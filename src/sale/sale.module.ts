import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeModule } from 'src/employee/employee.module';
import { Sale } from './entities/sale.entity';
import { SaleService } from './sale.service';

@Module({
  imports: [TypeOrmModule.forFeature([Sale]), EmployeeModule],
  providers: [SaleService],
})
export class SaleModule {}
