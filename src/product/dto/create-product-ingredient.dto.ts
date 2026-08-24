import { Transform } from 'class-transformer';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { IsDecimalString } from 'src/common/decoratos/decimal-string.decorator';

export class CreateProductIngredientDTO {
  @IsNotEmpty({
    message: 'Id do insumo não fornecido',
  })
  @IsUUID(4, {
    message: 'O id do insumo deve ser um uuid',
  })
  supplyId: string;

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
}
