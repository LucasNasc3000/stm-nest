import { Sale } from '../entities/sale.entity';

export type SaleResponse = Omit<Sale, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};
