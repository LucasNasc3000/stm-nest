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

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, name: 'total_weight' })
  totalWeight: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, name: 'weight_per_unit' })
  weightPerUnit: string;

  @Column({ type: 'varchar', length: 150 })
  supplier: string;

  @Column({ type: 'date', nullable: true, name: 'expiration_date' })
  expirationDate: Date;

  @ManyToOne(() => Employee, (employee) => employee.supplies, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  employee: Employee;

  @Column({ type: 'integer', nullable: true, name: 'low_stock' })
  lowStock: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: string;

  @Column({ type: 'varchar', length: 50 })
  reason: string;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    name: 'total_weight_per_register',
  })
  totalWeightPerRegister: string;

  @ManyToOne(() => Employee, (employee) => employee.suppliesHistory, {
    onDelete: 'RESTRICT',
  })
  registeredBy: Employee;

  @ManyToOne(() => SupplyRealTime, (supply) => supply.supplyHistory, {
    onDelete: 'RESTRICT',
  })
  supplyRealtime: SupplyRealTime;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
