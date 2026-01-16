import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Length, Max, Min } from 'class-validator';

export class PaginationByCategoryDTO {
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
    message: 'campo "categoria" não preenchido',
  })
  @IsString({
    message: 'campo "categoria" deve estar em formato de texto',
  })
  @Length(0, 150, {
    message: 'campo "categoria" deve ter no máximo 150 caracteres',
  })
  value: string;
}
