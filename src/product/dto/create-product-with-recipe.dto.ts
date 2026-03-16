import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { IsDecimalString } from 'src/common/decoratos/decimal-string.decorator';
import { CreateProductIngredientDTO } from './create-product-ingredient.dto';

export class CreateProductWithRecipeDTO {
  @IsNotEmpty({
    message: 'campo "nome" não preenchido',
  })
  @IsString({
    message: 'campo "nome" deve estar em formato de texto',
  })
  @Length(0, 50, {
    message: 'campo "nome" deve ter no máximo 50 caracteres',
  })
  readonly name: string;

  @IsNotEmpty({
    message: 'campo "categoria" não preenchido',
  })
  @IsString({
    message: 'campo "categoria" deve estar em formato de texto',
  })
  @Length(0, 50, {
    message: 'campo "categoria" deve ter no máximo 50 caracteres',
  })
  readonly category: string;

  @IsNotEmpty({
    message: 'campo "unidades" não preenchido',
  })
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({
    message: 'campo "unidades" deve ser um número inteiro',
  })
  readonly unities: number;

  @IsNotEmpty({
    message: 'campo "fornecedor" não preenchido',
  })
  @IsDateString()
  readonly expirationDate: string;

  @IsNotEmpty({
    message: 'campo "Quantidade mínima" não preenchido',
  })
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({
    message: 'campo "Quantidade mínima" deve ser um número inteiro',
  })
  @IsPositive({
    message: 'campo "Quantidade mínima" deve ser maior que zero',
  })
  readonly lowStock: number;

  @IsNotEmpty({
    message: 'Campo "preço" não preenchido',
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @IsDecimalString({
    message: 'O campo preco deve ser um string decima ex: 59.99',
  })
  readonly price: string;

  @IsNotEmpty({
    message: 'Campo "ingredientes" não preenchido',
  })
  @IsArray({
    message: 'Ingredientes devem estar em um array',
  })
  @ValidateNested({ each: true })
  @Type(() => CreateProductIngredientDTO)
  readonly productIngredient: CreateProductIngredientDTO[];
}
