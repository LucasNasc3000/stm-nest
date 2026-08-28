import { ProductInflow } from '../entities/product-inflow.entity';

export type ProductInflowResponse = Omit<
  ProductInflow,
  'createdAt' | 'updatedAt'
> & {
  createdAt: string;
  updatedAt: string;
};
