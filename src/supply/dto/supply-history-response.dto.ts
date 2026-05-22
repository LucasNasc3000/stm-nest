import { SupplyHistory } from '../entities/supply-history.entity';

export type SupplyHistoryResponse = Omit<
  SupplyHistory,
  'createdAt' | 'updatedAt'
> & {
  createdAt: string;
  updatedAt: string;
};
