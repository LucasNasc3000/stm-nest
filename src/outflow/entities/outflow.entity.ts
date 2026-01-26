import { Employee } from 'src/employee/entities/employee.entity';
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

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time', precision: 0 })
  hour: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'varchar', length: 50 })
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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
