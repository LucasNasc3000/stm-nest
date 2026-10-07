import { Type } from 'class-transformer';
import { Employee } from 'src/employee/entities/employee.entity';
import { Outflow } from 'src/outflow/entities/outflow.entity';
import { SupplyRealTime } from 'src/supply/entities/supply-realtime.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
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
    nullable: false,
  })
  @Type(() => SupplyRealTime)
  supplyRealTime: SupplyRealTime;

  @ManyToOne(() => Product, (product) => product.recipe, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  @Type(() => Product)
  product: Product;

  @ManyToOne(() => Employee, (employee) => employee.productIngredient, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  @Type(() => Employee)
  employee: Employee;

  @ManyToOne(() => Employee, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  @JoinColumn({ name: 'adminId' })
  @Type(() => Employee)
  admin: Employee;

  @OneToMany(() => Outflow, (outflow) => outflow.ingredient)
  @Type(() => Outflow)
  outflows: Outflow[];

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  quantity: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
