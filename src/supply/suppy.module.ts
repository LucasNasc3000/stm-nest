import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeModule } from 'src/employee/employee.module';
import { RoleModule } from 'src/role/role.module';
import { SupplyHistory } from './entities/supply-history.entity';
import { SupplyRealTime } from './entities/supply-realtime.entity';
import { SupplyFindService } from './supply-find.service';
import { SupplyController } from './supply.controller';
import { SupplyService } from './supply.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SupplyRealTime, SupplyHistory]),
    EmployeeModule,
    RoleModule,
  ],
  controllers: [SupplyController],
  providers: [SupplyService, SupplyFindService, Logger],
})
export class SupplyModule {}
