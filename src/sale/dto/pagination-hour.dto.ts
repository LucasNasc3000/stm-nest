import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class PaginationByHourDTO {
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
    message: '"campo "hora" não preenchido',
  })
  @IsString()
  readonly value: string;
}
