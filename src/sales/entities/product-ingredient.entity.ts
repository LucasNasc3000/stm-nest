import { SupplyRealTime } from 'src/supply/entities/supply-realtime.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'product_ingredient' })
export class ProductIngredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SupplyRealTime, (supplyRealTime) => supplyRealTime.recipes, {
    onDelete: 'RESTRICT',
  })
  supplyRealTime: SupplyRealTime;

  @ManyToOne(() => SupplyRealTime, (supplyRealTime) => supplyRealTime.recipes, {
    onDelete: 'RESTRICT',
  })
  product: SupplyRealTime;

  @Column({ type: 'integer' })
  quantity: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
