import { PartialType } from '@nestjs/mapped-types';
import { CreateSupplyRealtimeDTO } from './create-supply-realtime.dto';

export class UpdateSupplyRealTimeDTO extends PartialType(
  CreateSupplyRealtimeDTO,
) {}
