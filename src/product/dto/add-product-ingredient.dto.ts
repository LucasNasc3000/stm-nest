import { Transform } from 'class-transformer';
import { IsInt, IsPositive, IsUUID } from 'class-validator';

export class AddProductIngredientDTO {
  @IsUUID(4, {
    message: 'O id do ingrediente deve ser um uuid',
  })
  id: string;

  @IsUUID(4, {
    message: 'O id do insumo deve ser um uuid',
  })
  supplyId: string;

  @IsUUID(4, {
    message: 'O id do produto deve ser um uuid',
  })
  productId: string;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({
    message: 'campo "quantidade" deve ser um número inteiro',
  })
  @IsPositive({
    message: 'campo "quantidade" deve ser maior que zero',
  })
  readonly quantity: number;
}
