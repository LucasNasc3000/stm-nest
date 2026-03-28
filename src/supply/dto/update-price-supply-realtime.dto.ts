import { Transform } from 'class-transformer';
import { IsDecimalString } from 'src/common/decoratos/decimal-string.decorator';

export class UpdatePriceSupplyRealtimeDTO {
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @IsDecimalString({
    message: 'O campo "preço" deve ser um string decimal ex: 59.99',
  })
  readonly price: string;
}
