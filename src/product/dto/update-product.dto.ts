import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';
import { CreateProductIngredientDTO } from './create-product-ingredient.dto';

export class UpdateProductDTO {
  @IsNotEmpty({
    message: 'campo "nome" não preenchido',
  })
  @IsString({
    message: 'campo "nome" deve estar em formato de texto',
  })
  @Length(0, 50, {
    message: 'campo "nome" deve ter no máximo 50 caracteres',
  })
  readonly name?: string;

  @IsNotEmpty({
    message: 'campo "categoria" não preenchido',
  })
  @IsString({
    message: 'campo "categoria" deve estar em formato de texto',
  })
  @Length(0, 50, {
    message: 'campo "categoria" deve ter no máximo 50 caracteres',
  })
  readonly category?: string;

  @IsNotEmpty({
    message: 'campo "unidades" não preenchido',
  })
  @IsInt({
    message: 'campo "unidades" deve ser um número inteiro',
  })
  @IsPositive({
    message: 'campo "unidades" deve ser maior que zero',
  })
  readonly unities?: number;

  @IsNotEmpty({
    message: 'campo "fornecedor" não preenchido',
  })
  @IsDateString()
  readonly expirationDate?: string;

  @IsNotEmpty({
    message: 'campo "Quantidade mínima" não preenchido',
  })
  @IsInt({
    message: 'campo "Quantidade mínima" deve ser um número inteiro',
  })
  @IsPositive({
    message: 'campo "Quantidade mínima" deve ser maior que zero',
  })
  readonly lowStock?: number;

  @IsNotEmpty({
    message: 'Campo "preço" não preenchido',
  })
  @IsString({
    message: 'O campo "preço" deve estar no formato de texto',
  })
  @IsNumberString({
    no_symbols: true,
  })
  readonly price?: string;

  readonly productIngredient?: CreateProductIngredientDTO[];
}
