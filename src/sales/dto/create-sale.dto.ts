import {
  IsDateString,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateSaleDTO {
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
  @Length(0, 125, {
    message: 'campo "nome" deve ter no máximo 125 caracteres',
  })
  readonly name: string;

  @IsNotEmpty({
    message: 'campo "endereço" não preenchido',
  })
  @IsString({
    message: 'campo "endereço" deve estar em formato de texto',
  })
  @Length(0, 125, {
    message: 'campo "endereço" deve ter no máximo 125 caracteres',
  })
  readonly address: string;
}
