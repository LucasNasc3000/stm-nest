import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { EmployeeSituation } from 'src/common/enums/employee-situation.enum';
import { Employee } from '../entities/employee.entity';
import { RoleIdDTO } from './role.dto';

export class UpdateEmployeeAdminDTO {
  readonly role?: RoleIdDTO;

  @IsOptional()
  @IsEnum(EmployeeSituation, {
    message: 'Situação do funcionário inválida',
  })
  readonly situation?: EmployeeSituation;

  @IsOptional()
  @IsUUID(4, {
    message: 'O id do administrador deve ser um uuid',
  })
  readonly boss?: Employee;
}
