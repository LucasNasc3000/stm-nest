import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';

export class CreateSupplyDTO {
  @IsNotEmpty({
    message: 'campo "nome" não preenchido',
  })
  @IsString({
    message: 'campo "nome" deve estar em formato de texto',
  })
  @Length(0, 50, {
    message: 'campo "nome" deve ter no máximo 50 caracteres',
  })
  readonly name: string;

  @IsNotEmpty({
    message: 'campo "categoria" não preenchido',
  })
  @IsString({
    message: 'campo "categoria" deve estar em formato de texto',
  })
  @Length(0, 50, {
    message: 'campo "categoria" deve ter no máximo 50 caracteres',
  })
  readonly category: string;

  @IsNotEmpty({
    message: 'campo "quantidade" não preenchido',
  })
  @IsInt({
    message: 'campo "quantidade" deve ser um número inteiro',
  })
  @IsPositive({
    message: 'campo "quantidade" deve ser maior que zero',
  })
  readonly quantity: number;

  @IsNotEmpty({
    message: 'Campo "preço" não preenchido',
  })
  @IsString({
    message: 'O campo "preço" deve estar no formato de texto',
  })
  @IsNumberString({
    no_symbols: true,
  })
  readonly totalWeight: string;

  @IsNotEmpty({
    message: 'Campo "preço unitário" não preenchido',
  })
  @IsString({
    message: 'O campo "preço unitário" deve estar no formato de texto',
  })
  @IsNumberString({
    no_symbols: true,
  })
  readonly weightPerUnit: string;

  @IsNotEmpty({
    message: 'campo "fornecedor" não preenchido',
  })
  @IsString({
    message: 'campo "fornecedor" deve estar em formato de texto',
  })
  @Length(0, 100, {
    message: 'campo "fornecedor" deve ter no máximo 100 caracteres',
  })
  readonly supplier: string;

  @IsNotEmpty({
    message: 'campo "fornecedor" não preenchido',
  })
  @IsDateString()
  readonly expirationDate: string;

  @IsNotEmpty({
    message: 'campo "Quantidade mínima" não preenchido',
  })
  @IsInt({
    message: 'campo "Quantidade mínima" deve ser um número inteiro',
  })
  @IsPositive({
    message: 'campo "Quantidade mínima" deve ser maior que zero',
  })
  readonly lowStock: number;

  @IsNotEmpty({
    message: 'Campo "preço" não preenchido',
  })
  @IsString({
    message: 'O campo "preço" deve estar no formato de texto',
  })
  @IsNumberString({
    no_symbols: true,
  })
  readonly price: string;

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
    message: 'Campo "preço total por registro" não preenchido',
  })
  @IsString({
    message:
      'O campo "preço total por registro" deve estar no formato de texto',
  })
  @IsNumberString({
    no_symbols: true,
  })
  readonly totalWeightPerRegister: string;
}
