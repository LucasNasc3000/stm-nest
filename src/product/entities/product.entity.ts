import { Employee } from 'src/employee/entities/employee.entity';
import { Outflow } from 'src/outflow/entities/outflow.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SaleItems } from '../../sale/entities/sale-items.entity';
import { ProductInflow } from './product-inflow.entity';
import { ProductIngredient } from './product-ingredient.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'integer', default: 0 })
  unities: number;

  @Column({ type: 'integer', nullable: true, name: 'low_stock' })
  lowStock: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: string;

  @Column({ type: 'date', name: 'expiration_date' })
  expirationDate: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @ManyToOne(() => Employee, (employee) => employee.supplies, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  employee: Employee;

  @OneToMany(() => ProductIngredient, (recipe) => recipe.product)
  recipe: ProductIngredient[];

  @OneToMany(() => SaleItems, (sale) => sale.product)
  sales: SaleItems[];

  @OneToMany(() => Outflow, (outflow) => outflow.product)
  outflows: Outflow[];

  @OneToMany(() => ProductInflow, (inflow) => inflow.product)
  inflows: ProductInflow[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
