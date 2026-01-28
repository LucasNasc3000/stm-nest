import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductIngredient } from './product-ingredient.entity';
import { SaleItems } from './sale-items.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'integer' })
  unities: number;

  @Column({ type: 'date', name: 'expiration_date' })
  expirationDate: Date;

  @Column({ type: 'integer', nullable: true, name: 'low_stock' })
  lowStock: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: string;

  @OneToMany(() => ProductIngredient, (recipe) => recipe.product)
  recipe: ProductIngredient[];

  @OneToMany(() => SaleItems, (sale) => sale.product)
  sales: SaleItems[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Index()
  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;
}
