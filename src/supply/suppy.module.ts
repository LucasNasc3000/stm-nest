import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeModule } from 'src/employee/employee.module';
import { SupplyHistory } from './entities/supply-history.entity';
import { SupplyRealTime } from './entities/supply-realtime.entity';
import { SupplyController } from './supply.controller';
import { SupplyService } from './supply.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SupplyRealTime, SupplyHistory]),
    EmployeeModule,
  ],
  controllers: [SupplyController],
  providers: [SupplyService, Logger],
  exports: [TypeOrmModule],
})
export class SupplyModule {}
