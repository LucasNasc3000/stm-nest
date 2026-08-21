import { Product } from '../entities/product.entity';

export type ProductResponse = Omit<Product, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};
