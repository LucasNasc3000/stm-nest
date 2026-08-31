import { Transform, Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsUUID,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class PaginationByInflowEmployeeDTO {
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

  @ValidateIf((o) => !o.id)
  @IsNotEmpty({
    message: 'Email ou id são necessários para buscar os dados',
  })
  @IsEmail(
    {},
    {
      message: 'Email inválido',
    },
  )
  email?: string;

  @ValidateIf((o) => !o.email)
  @IsNotEmpty({
    message: 'Email ou id são necessários para buscar os dados',
  })
  @IsUUID(4, {
    message: 'O id inválido',
  })
  id?: string;

  @IsNotEmpty({
    message: 'campo "para exibição" não preenchido',
  })
  @Transform(({ value }) => value === 'true')
  forDisplay: boolean;
}
