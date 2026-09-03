import { Type } from 'class-transformer';
import { Employee } from 'src/employee/entities/employee.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Sale } from '../../sale/entities/sale.entity';

@Entity()
export class Platform {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, name: 'tax_percentage' })
  taxPercentage: string;

  @ManyToOne(() => Employee, (employee) => employee.platforms, {
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

  @OneToMany(() => Sale, (sale) => sale.platform)
  @Type(() => Sale)
  sales: Sale[];
}
