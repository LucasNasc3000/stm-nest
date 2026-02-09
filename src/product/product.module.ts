import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeModule } from 'src/employee/employee.module';
import { Product } from './entities/product.entity';
import { ProductFindService } from './product-find.service';
import { ProductService } from './product.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), EmployeeModule],
  providers: [ProductService, ProductFindService],
})
export class ProductModule {}
