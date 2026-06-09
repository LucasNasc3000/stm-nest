import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class PaginationByInflowExpDateDTO {
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
    message: 'campo "data" não preenchido',
  })
  @IsDateString()
  value: string;
}
