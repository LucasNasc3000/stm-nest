import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, Matches, Max, Min } from 'class-validator';

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

  // Source - https://stackoverflow.com/a
  // Posted by M00SH
  // Retrieved 2026-01-19, License - CC BY-SA 4.0

  @IsNotEmpty({
    message: '"campo "hora" não preenchido',
  })
  @Matches(/^(1[0-2]|0?[1-9]):([0-5]?[0-9]):([0-5]?[0-9])$/)
  readonly value: string;
}
