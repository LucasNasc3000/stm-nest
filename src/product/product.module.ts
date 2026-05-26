import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeModule } from 'src/employee/employee.module';
import { RoleModule } from 'src/role/role.module';
import { SupplyRealTime } from 'src/supply/entities/supply-realtime.entity';
import { ProductInflow } from './entities/product-inflow.entity';
import { ProductIngredient } from './entities/product-ingredient.entity';
import { Product } from './entities/product.entity';
import { ProductFindService } from './product-find.service';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      SupplyRealTime,
      ProductIngredient,
      ProductInflow,
    ]),
    EmployeeModule,
    RoleModule,
  ],
  controllers: [ProductController],
  providers: [ProductService, ProductFindService, Logger],
})
export class ProductModule {}
