import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Length, Max, Min } from 'class-validator';

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
  @IsString({
    message: 'campo "motivo" deve estar em formato de texto',
  })
  @Length(0, 50, {
    message: 'campo "motivo" deve ter no máximo 50 caracteres',
  })
  value: string;
}
