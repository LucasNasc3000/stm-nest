import { SupplyRealTime } from '../entities/supply-realtime.entity';

export type SupplyRealTimeResponse = Omit<
  SupplyRealTime,
  'createdAt' | 'updatedAt'
> & {
  createdAt: string;
  updatedAt: string;
};
