import { Type } from 'class-transformer';
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
import { Platform } from '../../platform/entities/platform.entity';
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

  @Column({ type: 'varchar', length: 18, name: 'phone_number', nullable: true })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 125, nullable: true })
  address: string;

  @OneToMany(() => SaleItems, (saleItems) => saleItems.sale)
  @Type(() => SaleItems)
  saleItems: SaleItems[];

  @ManyToOne(() => Employee, (employee) => employee.outflows, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  @Type(() => Employee)
  employee: Employee;

  @ManyToOne(() => Platform, (platform) => platform.sales, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @Type(() => Platform)
  platform: Platform;

  @Column({ type: 'numeric', precision: 10, scale: 2, name: 'total_price' })
  totalPrice: string;

  @Column({ type: 'enum', enum: SaleStatus })
  status: SaleStatus;

  @Column({ type: 'enum', enum: SaleReason, nullable: true })
  reason: SaleReason;

  @Column({ type: 'varchar', length: 500, nullable: true })
  notes: string;

  @Column({ type: 'boolean', nullable: true, name: 'stock_fully_returned' })
  stockFullyReturned: boolean;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'platform_name_snapshot',
    nullable: true,
  })
  platformNameSnapshot: string;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    name: 'applied_tax_percentage',
    nullable: true,
  })
  appliedTaxPercentage: string;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    name: 'net_value',
    nullable: true,
  })
  netValue: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
