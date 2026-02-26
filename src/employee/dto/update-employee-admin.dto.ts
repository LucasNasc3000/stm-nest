import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { EmployeeSituation } from 'src/common/enums/employee-situation.enum';
import { Employee } from '../entities/employee.entity';
import { RoleIdDTO } from './role.dto';

export class UpdateEmployeeAdminDTO {
  readonly role?: RoleIdDTO;

  @IsNotEmpty({
    message: 'campo "situação" não preenchido',
  })
  @IsEnum(EmployeeSituation, {
    message: 'Situação do funcionário inválida',
  })
  readonly situation?: EmployeeSituation;

  @IsNotEmpty({
    message: 'Id do administrador não fornecido',
  })
  @IsUUID(4, {
    message: 'O id do administrador deve ser um uuid',
  })
  readonly boss?: Employee;
}
