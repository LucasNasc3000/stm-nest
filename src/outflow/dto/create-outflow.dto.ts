import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateOutflowDTO {
  @IsNotEmpty({
    message: 'campo "data" não preenchido',
  })
  @IsDateString()
  readonly date: string;

  // Source - https://stackoverflow.com/a
  // Posted by M00SH
  // Retrieved 2026-01-19, License - CC BY-SA 4.0

  @Matches(/^(1[0-2]|0?[1-9]):([0-5]?[0-9]):([0-5]?[0-9])$/)
  readonly hour: string;

  @IsNotEmpty({
    message: 'campo "nome" não preenchido',
  })
  @IsString({
    message: 'campo "nome" deve estar em formato de texto',
  })
  @Length(0, 50, {
    message: 'campo "nome" deve ter no máximo 125 caracteres',
  })
  readonly name: string;

  @IsNotEmpty({
    message: 'campo "categoria" não preenchido',
  })
  @IsString({
    message: 'campo "categoria" deve estar em formato de texto',
  })
  @Length(0, 50, {
    message: 'campo "categoria" deve ter no máximo 100 caracteres',
  })
  readonly category: string;

  @IsNotEmpty({
    message: 'campo "motivo" não preenchido',
  })
  @IsString({
    message: 'campo "motivo" deve estar em formato de texto',
  })
  @Length(0, 50, {
    message: 'campo "motivo" deve ter no máximo 50 caracteres',
  })
  readonly reason: string;

  @IsNotEmpty({
    message: 'campo "unidades" não preenchido',
  })
  @IsInt({
    message: 'campo "unidades" deve ser um número inteiro',
  })
  @IsPositive({
    message: 'campo "unidades" deve ser maior que zero',
  })
  readonly unities: number;
}
