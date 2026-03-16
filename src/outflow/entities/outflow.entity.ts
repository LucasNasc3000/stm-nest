import { OutflowType } from 'src/common/enums/outflow-type.enum';
import { Employee } from 'src/employee/entities/employee.entity';
import { ProductIngredient } from 'src/product/entities/product-ingredient.entity';
import { Product } from 'src/product/entities/product.entity';
import { SupplyRealTime } from 'src/supply/entities/supply-realtime.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Outflow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: OutflowType })
  targetType: OutflowType;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time', precision: 0 })
  hour: string;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  category: string;

  @Column({ type: 'varchar', length: 120 })
  reason: string;

  @Column({ type: 'integer' })
  unities: number;

  @ManyToOne(() => Employee, (employee) => employee.outflows, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  employee: Employee;

  @ManyToOne(
    () => SupplyRealTime,
    (supplyRealTime) => supplyRealTime.outflows,
    {
      onDelete: 'RESTRICT',
      nullable: true,
    },
  )
  supplyRealTime: SupplyRealTime;

  @ManyToOne(() => ProductIngredient, (ingredient) => ingredient.outflows, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  ingredient: ProductIngredient;

  @ManyToOne(() => Product, (product) => product.outflows, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  product: Product;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
