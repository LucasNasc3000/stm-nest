import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
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

  @IsNotEmpty({
    message: 'Email do funcionário não fornecido',
  })
  @IsString({
    message: 'O email do funcionário deve estar em formato de texto',
  })
  @IsEmail()
  value: string;

  @IsNotEmpty({
    message: 'campo "para exibição" não preenchido',
  })
  @Type(() => Boolean)
  forDisplay: boolean;
}
