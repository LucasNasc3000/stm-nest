import { SupplyRealTime } from 'src/supply/entities/supply-realtime.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity({ name: 'product_ingredient' })
export class ProductIngredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SupplyRealTime, (supplyRealTime) => supplyRealTime.recipes, {
    onDelete: 'RESTRICT',
  })
  supplyRealTime: SupplyRealTime;

  @ManyToOne(() => Product, (product) => product.recipe, {
    onDelete: 'RESTRICT',
  })
  product: Product;

  @Column({ type: 'integer' })
  quantity: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
