import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogEmployee } from './entities/log-employee.entity';
import { LogsService } from './log.service';

@Module({
  imports: [TypeOrmModule.forFeature([LogEmployee])],
  providers: [LogsService],
  exports: [LogsService],
})
export class LogsModule {}
