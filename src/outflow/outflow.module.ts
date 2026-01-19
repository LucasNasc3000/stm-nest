import { Module } from '@nestjs/common';
import { OutflowService } from './outflow.service';

@Module({
  providers: [OutflowService],
})
export class OutflowModule {}
