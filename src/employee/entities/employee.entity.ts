import { IsEmail } from 'class-validator';
import { EmployeeSituation } from 'src/common/enums/employee-situation.enum';
import { Outflow } from 'src/outflow/entities/outflow.entity';
import { ProductIngredient } from 'src/product/entities/product-ingredient.entity';
import { RefreshTokenEmployee } from 'src/refresh-tokens/entities/refresh-token-employee.entity';
import { Sale } from 'src/sale/entities/sale.entity';
import { SupplyHistory } from 'src/supply/entities/supply-history.entity';
import { SupplyRealTime } from 'src/supply/entities/supply-realtime.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';

@Entity()
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 14, unique: true })
  cpf: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @IsEmail()
  email: string;

  @Column({ type: 'varchar', length: 125 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  @ManyToOne(() => Role, (role) => role.employees, {
    onDelete: 'RESTRICT',
  })
  role: Role;

  @Column({
    type: 'enum',
    enum: EmployeeSituation,
    default: EmployeeSituation.EMPLOYED,
  })
  situation: EmployeeSituation;

  @ManyToOne(() => Employee, (employee) => employee.subordinates, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'boss' })
  boss?: Employee;

  @OneToMany(() => Employee, (employee) => employee.boss)
  subordinates: Employee[];

  @OneToMany(() => SupplyRealTime, (supply) => supply.employee)
  supplies: SupplyRealTime[];

  @OneToMany(() => SupplyHistory, (supply) => supply.employee)
  suppliesHistory: SupplyHistory[];

  @OneToMany(() => Outflow, (outflow) => outflow.employee)
  outflows: Outflow[];

  @OneToMany(() => Sale, (sale) => sale.employee)
  sales: Sale[];

  @OneToMany(() => ProductIngredient, (ingredient) => ingredient.employee)
  productIngredient: ProductIngredient[];

  @OneToMany(() => RefreshTokenEmployee, (token) => token.employee)
  refresh_tokens: RefreshTokenEmployee[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
