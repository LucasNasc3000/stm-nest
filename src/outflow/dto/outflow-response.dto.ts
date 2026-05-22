import { Outflow } from '../entities/outflow.entity';

export type OutflowResponse = Omit<Outflow, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};
