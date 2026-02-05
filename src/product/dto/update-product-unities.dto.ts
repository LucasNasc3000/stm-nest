import { IsInt, IsPositive, IsUUID } from 'class-validator';
import { UpdateProductIngredientDTO } from './update-product-ingredient.dto';

export class UpdateProductUnitiesDTO {
  @IsUUID(4, {
    message: 'O id do produto deve ser um uuid',
  })
  id: string;

  @IsInt({
    message: 'campo "adicionar unidades" deve ser um número inteiro',
  })
  @IsPositive({
    message: 'campo "adicionar unidades" deve ser maior que zero',
  })
  readonly addUnities?: number;

  @IsInt({
    message: 'campo "tirar unidades" deve ser um número inteiro',
  })
  @IsPositive({
    message: 'campo "tirar unidades" deve ser maior que zero',
  })
  readonly takeUnities?: number;

  readonly productIngredient: UpdateProductIngredientDTO[];
}
