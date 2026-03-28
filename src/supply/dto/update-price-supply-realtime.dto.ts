import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { IsDecimalString } from 'src/common/decoratos/decimal-string.decorator';
import { SupplyReason } from 'src/common/enums/supply-history-reason.enum';

export class UpdatePriceSupplyRealtimeDTO {
  @IsNotEmpty({
    message: 'campo "motivo" não preenchido',
  })
  @IsEnum(SupplyReason, {
    message: `campo "motivo" deve ser uma das seguintes opções: ${Object.values(SupplyReason).join(', ')}`,
  })
  readonly reason: SupplyReason;

  @IsNotEmpty({
    message: 'campo "detalhes" deve ser preenchido',
  })
  @IsString()
  @Length(12, 600, {
    message: 'campo "detalhes" deve ter no máximo 600 caracteres',
  })
  readonly details: string;

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
