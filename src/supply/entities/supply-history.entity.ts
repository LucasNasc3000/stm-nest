import { Employee } from 'src/employee/entities/employee.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SupplyRealTime } from './supply-realtime.entity';

@Entity({ name: 'supply_history' })
export class SupplyHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  category: string;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, name: 'weight_per_unit' })
  weightPerUnit: string;

  @Column({ type: 'varchar', length: 100 })
  supplier: string;

  @Column({ type: 'date', name: 'expiration_date' })
  expirationDate: string;

  @ManyToOne(() => Employee, (employee) => employee.suppliesHistory, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  employee: Employee;

  @Column({ type: 'integer', nullable: true, name: 'low_stock' })
  lowStock: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, name: 'total_price' })
  totalPrice: string;

  @Column({ type: 'varchar', length: 50 })
  reason: string;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    name: 'total_weight_per_register',
  })
  totalWeightPerRegister: string;

  @ManyToOne(() => SupplyRealTime, (supply) => supply.supplyHistory, {
    onDelete: 'RESTRICT',
    nullable: false,
  })
  supplyRealTime: SupplyRealTime;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
