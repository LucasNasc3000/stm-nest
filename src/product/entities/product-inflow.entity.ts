import { Type } from 'class-transformer';
import { ProductInflowReason } from 'src/common/enums/product-inflow-reason.enum';
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
import { Product } from './product.entity';

@Entity({ name: 'product_inflow' })
export class ProductInflow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: false })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'integer' })
  unities: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: string;

  @Column({ type: 'date', name: 'expiration_date', nullable: false })
  expirationDate: string;

  @Column({ type: 'enum', enum: ProductInflowReason, name: 'inflow_reason' })
  inflowReason: ProductInflowReason;

  @Column({ type: 'boolean', name: 'use_stock_supplies' })
  useStockSupplies: boolean;

  @Column({
    type: 'bigint',
    generated: 'increment',
    insert: false,
    update: false,
  })
  seq: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  notes: string;

  @ManyToOne(() => Product, (product) => product.inflows, {
    onDelete: 'RESTRICT',
  })
  @Type(() => Product)
  product: Product;

  @ManyToOne(() => Employee, { onDelete: 'RESTRICT', nullable: true })
  @Type(() => Employee)
  employee: Employee;

  @ManyToOne(() => Employee, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  @JoinColumn({ name: 'adminId' })
  @Type(() => Employee)
  admin: Employee;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
