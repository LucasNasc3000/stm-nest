import { IsInt, IsPositive } from 'class-validator';

export class UpdateProductUnitiesDTO {
  @IsInt({
    message: 'campo "adicionar unidades" deve ser um número inteiro',
  })
  @IsPositive({
    message: 'campo "adicionar unidades" deve ser maior que zero',
  })
  readonly addUnities?: number;
}
