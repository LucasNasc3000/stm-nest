import { Employee } from 'src/employee/entities/employee.entity';
import { Outflow } from 'src/outflow/entities/outflow.entity';
import { ProductIngredient } from 'src/product/entities/product-ingredient.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SupplyHistory } from './supply-history.entity';

@Entity({ name: 'supply_real_time' })
export class SupplyRealTime {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  category: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, name: 'total_weight' })
  totalWeight: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, name: 'weight_per_unit' })
  weightPerUnit: string;

  @Column({ type: 'varchar', length: 100 })
  supplier: string;

  @Column({ type: 'date', name: 'expiration_date' })
  expirationDate: string;

  @ManyToOne(() => Employee, (employee) => employee.supplies, {
    onDelete: 'RESTRICT',
  })
  employee: Employee;

  @Column({ type: 'integer', nullable: true, name: 'low_stock' })
  lowStock: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, name: 'total_price' })
  totalPrice: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @OneToMany(() => SupplyHistory, (supply) => supply.supplyRealTime)
  supplyHistory: SupplyHistory[];

  @OneToMany(() => Outflow, (outflow) => outflow.supplyRealTime)
  outflows: Outflow[];

  @OneToMany(() => ProductIngredient, (recipe) => recipe.supplyRealTime)
  recipes: ProductIngredient[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
