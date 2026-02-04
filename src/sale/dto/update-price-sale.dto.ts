import { IsNumberString, IsString } from 'class-validator';

export class UpdatePriceSaleDTO {
  @IsString({
    message: 'O campo "preço" deve estar no formato de texto',
  })
  @IsNumberString({
    no_symbols: true,
  })
  readonly price?: string;
}
