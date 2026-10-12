import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { EmployeeSituation } from 'src/common/enums/employee-situation.enum';

export class UpdateEmployeeAdminDTO {
  @IsOptional()
  @IsUUID(4, {
    message: 'O id do cargo deve ser um uuid',
  })
  roleId?: string;

  @IsOptional()
  @IsEnum(EmployeeSituation, {
    message: 'Situação do funcionário inválida',
  })
  readonly situation?: EmployeeSituation;

  @IsOptional()
  @IsUUID(4, {
    message: 'O id do administrador deve ser um uuid',
  })
  readonly boss?: string;
}
