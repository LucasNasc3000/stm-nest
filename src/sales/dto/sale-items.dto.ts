import {
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class SaleItemsDTO {
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
  readonly price: string;

  @IsNotEmpty({
    message: 'Id do produto não fornecido',
  })
  @IsUUID(4, {
    message: 'O id do produto deve ser um uuid',
  })
  product: string;
}
