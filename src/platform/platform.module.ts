import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from 'src/employee/entities/employee.entity';
import { Platform } from './entities/platform.entity';
import { PlatformController } from './platform.controller';
import { PlatformService } from './platform.service';

@Module({
  imports: [TypeOrmModule.forFeature([Platform, Employee])],
  controllers: [PlatformController],
  providers: [PlatformService],
})
export class PlatformModule {}
