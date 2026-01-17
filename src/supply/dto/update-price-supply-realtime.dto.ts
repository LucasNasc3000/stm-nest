import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';

export class UpdatePriceSupplyRealTimeDTO {
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
  price: string;
}
