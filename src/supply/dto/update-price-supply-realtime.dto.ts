import { IsNumberString, IsString } from 'class-validator';

export class UpdatePriceSupplyRealtimeDTO {
  @IsString({
    message: 'O campo "preço unitário" deve estar no formato de texto',
  })
  @IsNumberString({
    no_symbols: true,
  })
  readonly price: string;
}
