import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { IsDecimalString } from 'src/common/decoratos/decimal-string.decorator';

export class UpdateProductIngredientDTO {
  @IsUUID(4, {
    message: 'O id do ingrediente deve ser um uuid',
  })
  readonly id: string;

  @IsUUID(4, {
    message: 'O id do insumo deve ser um uuid',
  })
  readonly supplyId: string;

  @IsNotEmpty({
    message: 'Campo "quantidade" não preenchido',
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @IsDecimalString({
    message: 'O campo preco deve ser um string decimal ex: 59.99',
  })
  readonly quantity: string;

  @IsOptional()
  @IsBoolean()
  readonly disableIngredient?: boolean;
}
