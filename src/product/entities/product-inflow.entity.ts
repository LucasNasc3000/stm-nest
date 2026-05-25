import { ProductInflowReason } from 'src/common/enums/product-inflow-reason.enum';
import { Employee } from 'src/employee/entities/employee.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class ProductInflow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'integer' })
  unities: number;

  @Column({ type: 'enum', enum: ProductInflowReason, name: 'inflow_reason' })
  inflowReason: ProductInflowReason;

  @Column({ type: 'date', name: 'expiration_date' })
  expirationDate: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: string;

  @ManyToOne(() => Product, (product) => product.inflows, {
    onDelete: 'RESTRICT',
  })
  product: Product;

  @ManyToOne(() => Employee, { onDelete: 'RESTRICT', nullable: true })
  employee: Employee;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
