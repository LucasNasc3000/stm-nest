import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeModule } from 'src/employee/employee.module';
import { SupplyHistory } from './entities/supply-history.entity';
import { SupplyRealTime } from './entities/supply-realtime.entity';
import { SupplyRealTimeService } from './supply-realtime.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SupplyRealTime, SupplyHistory]),
    EmployeeModule,
  ],
  controllers: [],
  providers: [SupplyRealTimeService],
})
export class SupplyModule {}
