import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupplyHistory } from './entities/supply-history.entity';
import { SupplyRealTime } from './entities/supply-realtime.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SupplyRealTime, SupplyHistory])],
  controllers: [],
  providers: [],
})
export class SupplyModule {}
