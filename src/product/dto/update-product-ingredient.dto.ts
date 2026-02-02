import { IsInt, IsNotEmpty, IsPositive, IsUUID } from 'class-validator';

export class UpdateProductIngredientDTO {
  @IsNotEmpty({
    message: 'Id do ingrediente não fornecido',
  })
  @IsUUID(4, {
    message: 'O id do ingrediente deve ser um uuid',
  })
  id: string;

  @IsNotEmpty({
    message: 'Id do insumo não fornecido',
  })
  @IsUUID(4, {
    message: 'O id do insumo deve ser um uuid',
  })
  supplyId: string;

  @IsNotEmpty({
    message: 'campo "quantidade" não preenchido',
  })
  @IsInt({
    message: 'campo "quantidade" deve ser um número inteiro',
  })
  @IsPositive({
    message: 'campo "quantidade" deve ser maior que zero',
  })
  readonly quantity: number;

  readonly disableProduct?: boolean;
}
