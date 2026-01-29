import { Employee } from 'src/employee/entities/employee.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SaleItems } from './sale-items.entity';

@Entity()
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time', precision: 0 })
  hour: string;

  @Column({ type: 'varchar', length: 125, name: 'client_name' })
  clientName: string;

  @Column({ type: 'varchar', length: 14, name: 'phone_number' })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 125 })
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
}
