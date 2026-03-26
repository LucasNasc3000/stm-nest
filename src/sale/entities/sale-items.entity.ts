import { Outflow } from 'src/outflow/entities/outflow.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
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

  @Column({ type: 'numeric', precision: 10, scale: 2, name: 'price_at_sale' })
  priceAtSale: string;

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

  @OneToOne(() => Outflow, (outflow) => outflow.saleItem, { nullable: true })
  outflow: Outflow;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
