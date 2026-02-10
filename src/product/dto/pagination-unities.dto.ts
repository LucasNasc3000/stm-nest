import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsPositive, Max, Min } from 'class-validator';

export class PaginationByUnitiesDTO {
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
    message: 'campo "unidades" não preenchido',
  })
  @IsInt({
    message: 'campo "unidades" deve ser um número inteiro',
  })
  @IsPositive({
    message: 'campo "unidades" deve ser maior que zero',
  })
  readonly value: string;
}
