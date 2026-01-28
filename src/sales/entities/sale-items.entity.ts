import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';
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
  })
  product: Product;

  @ManyToOne(() => Sale, (sale) => sale.saleItems, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  sale: Sale;
}
