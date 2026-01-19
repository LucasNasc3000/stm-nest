import { Employee } from 'src/employee/entities/employee.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
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

  @OneToMany(() => SupplyHistory, (supply) => supply.supplyRealtime)
  supplyHistory: SupplyHistory[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Index()
  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;
}
