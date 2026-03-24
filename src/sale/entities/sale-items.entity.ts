import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { Sale } from './sale.entity';

@Entity({ name: 'sale_items' })
export class SaleItems {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: string;

  @ManyToOne(() => Product, (product) => product.sales, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  product: Product;

  @ManyToOne(() => Sale, (sale) => sale.saleItems, {
    onDelete: 'RESTRICT',
    nullable: false,
  })
  sale: Sale;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
