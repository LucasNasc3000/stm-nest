import { IsEmail, IsEnum, IsString } from 'class-validator';
import { EmployeeRole } from 'src/common/enums/employee-role.enum';
import { EmployeeSituation } from 'src/common/enums/employee-situation.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 14, unique: true })
  @IsString()
  cpf: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @IsEmail()
  email: string;

  @Column({ type: 'varchar', length: 125 })
  @IsString()
  name: string;

  @Column({ type: 'varchar', length: 255 })
  @IsString()
  password_hash: string;

  @Column({
    type: 'enum',
    enum: EmployeeRole,
    array: true,
  })
  role: EmployeeRole[];

  @Column({
    type: 'enum',
    enum: EmployeeSituation,
    default: EmployeeSituation.EMPLOYED,
  })
  @IsEnum(EmployeeSituation)
  situation: EmployeeSituation;

  @Column({ type: 'varchar', length: 15 })
  @IsString()
  phone_number: string;

  @Column({ type: 'varchar', length: 100 })
  @IsString()
  address: string;
}
