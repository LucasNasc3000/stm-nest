import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';

export class UpdatePriceSaleDTO {
  @IsNotEmpty({
    message: 'Campo "preço" não preenchido',
  })
  @IsString({
    message: 'O campo "preço" deve estar no formato de texto',
  })
  @IsNumberString({
    no_symbols: true,
  })
  readonly price?: string;
}
