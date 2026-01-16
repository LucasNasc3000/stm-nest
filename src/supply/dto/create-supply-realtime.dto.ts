import {
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';

export class CreateSupplyRealtimeDTO {
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
  @Length(0, 125, {
    message: 'campo "fornecedor" deve ter no máximo 125 caracteres',
  })
  readonly supplier: string;
}
