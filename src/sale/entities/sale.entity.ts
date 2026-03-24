import { IsEmail } from 'class-validator';
import { SaleReason } from 'src/common/enums/sale-reason.enum';
import { SaleStatus } from 'src/common/enums/sale-status.enum';
import { Employee } from 'src/employee/entities/employee.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SaleItems } from './sale-items.entity';

@Entity()
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 125, name: 'client_name' })
  clientName: string;

  @Column({ type: 'varchar', length: 50, name: 'client_email', nullable: true })
  @IsEmail()
  clientEmail: string;

  @Column({ type: 'varchar', length: 14, name: 'phone_number', nullable: true })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 125, nullable: true })
  address: string;

  @OneToMany(() => SaleItems, (saleItems) => saleItems.sale)
  saleItems: SaleItems[];

  @ManyToOne(() => Employee, (employee) => employee.outflows, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  employee: Employee;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: string;

  @Column({ type: 'enum', enum: SaleStatus })
  status: SaleStatus;

  @Column({ type: 'enum', enum: SaleReason })
  reason: SaleReason;

  @Column({ type: 'varchar', length: 500, nullable: true })
  notes: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
