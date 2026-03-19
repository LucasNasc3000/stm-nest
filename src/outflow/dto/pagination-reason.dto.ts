import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, Max, Min } from 'class-validator';
import { OutflowReason } from 'src/common/enums/outflow-reason.enum';

export class PaginationByReasonDTO {
  @IsInt({
    message: 'Limite precisa ser um numero inteiro',
  })
  @Min(0, {
    message: 'Limite não pode ser menor que 0',
  })
  @Max(20, {
    message: 'Limite não pode ser maior que 20',
  })
  @Type(() => Number)
  limit: number;

  @IsInt({
    message: 'Offset precisa ser um numero inteiro',
  })
  @Min(0, {
    message: 'Offset não deve ser menor que 0',
  })
  @Type(() => Number)
  offset: number;

  @IsNotEmpty({
    message: 'campo "motivo" não preenchido',
  })
  @IsEnum(OutflowReason, {
    message: `campo motivo deve ser uma das seguintes opções: ${Object.values(OutflowReason).join(', ')}`,
  })
  value: OutflowReason;
}
