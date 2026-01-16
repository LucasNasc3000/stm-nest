import { Employee } from 'src/employee/entities/employee.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SupplyRealTime {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  totalweight: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, name: 'weight_per_unit' })
  weightPerUnit: string;

  @Column({ type: 'varchar', length: 150 })
  supplier: string;

  @Column({ type: 'timestamp', nullable: true, name: 'expiration_date' })
  expirationDate: Date;

  @ManyToOne(() => Employee, (employee) => employee.supplies, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  employee: Employee;

  @Column({ type: 'integer', name: 'minimun_quantity' })
  minimunQuantity: number;

  @Column({ type: 'integer', nullable: true })
  lowStock: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: string;
}
