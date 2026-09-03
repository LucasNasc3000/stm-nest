import { Type } from 'class-transformer';
import { SupplyReason } from 'src/common/enums/supply-history-reason.enum';
import { Employee } from 'src/employee/entities/employee.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
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
  @Type(() => Employee)
  employee: Employee;

  @ManyToOne(() => Employee, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  @JoinColumn({ name: 'adminId' })
  @Type(() => Employee)
  admin: Employee;

  @Column({ type: 'integer', nullable: true, name: 'low_stock' })
  lowStock: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, name: 'total_price' })
  totalPrice: string;

  @Column({ type: 'enum', enum: SupplyReason, nullable: true })
  reason: SupplyReason;

  @Column({ type: 'varchar', length: 600, nullable: true })
  details: string;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    name: 'total_weight_per_register',
  })
  totalWeightPerRegister: string;

  @Column({
    type: 'bigint',
    generated: 'increment',
    insert: false,
    update: false,
  })
  seq: number;

  @ManyToOne(() => SupplyRealTime, (supply) => supply.supplyHistory, {
    onDelete: 'RESTRICT',
    nullable: false,
  })
  @Type(() => SupplyRealTime)
  supplyRealTime: SupplyRealTime;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
