import { Type } from 'class-transformer';
import { OutflowReason } from 'src/common/enums/outflow-reason.enum';
import { OutflowType } from 'src/common/enums/outflow-type.enum';
import { Employee } from 'src/employee/entities/employee.entity';
import { ProductIngredient } from 'src/product/entities/product-ingredient.entity';
import { Product } from 'src/product/entities/product.entity';
import { SaleItems } from 'src/sale/entities/sale-items.entity';
import { SupplyRealTime } from 'src/supply/entities/supply-realtime.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Outflow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: OutflowType })
  targetType: OutflowType;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  category: string;

  @Column({ type: 'enum', enum: OutflowReason })
  reason: OutflowReason;

  @Column({ type: 'varchar', length: 500, nullable: true })
  notes: string;

  @Column({ type: 'integer', nullable: true })
  unities: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  quantity: string;

  @ManyToOne(() => Employee, (employee) => employee.outflows, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  @Type(() => Employee)
  employee: Employee;

  @ManyToOne(
    () => SupplyRealTime,
    (supplyRealTime) => supplyRealTime.outflows,
    {
      onDelete: 'RESTRICT',
      nullable: true,
    },
  )
  @Type(() => SupplyRealTime)
  supplyRealTime: SupplyRealTime;

  @ManyToOne(() => ProductIngredient, (ingredient) => ingredient.outflows, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  @Type(() => ProductIngredient)
  ingredient: ProductIngredient;

  @ManyToOne(() => Product, (product) => product.outflows, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  @Type(() => Product)
  product: Product;

  @OneToOne(() => SaleItems, (saleItem) => saleItem.outflow, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  @JoinColumn()
  @Type(() => SaleItems)
  saleItem: SaleItems;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
