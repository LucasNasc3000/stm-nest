import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';
import { UpdateProductIngredientDTO } from './update-product-ingredient.dto';

export class UpdateProductDTO {
  @IsString({
    message: 'campo "nome" deve estar em formato de texto',
  })
  @Length(0, 50, {
    message: 'campo "nome" deve ter no máximo 50 caracteres',
  })
  readonly name?: string;

  @IsString({
    message: 'campo "categoria" deve estar em formato de texto',
  })
  @Length(0, 50, {
    message: 'campo "categoria" deve ter no máximo 50 caracteres',
  })
  readonly category?: string;

  @IsInt({
    message: 'campo "unidades" deve ser um número inteiro',
  })
  @IsPositive({
    message: 'campo "unidades" deve ser maior que zero',
  })
  readonly unities?: number;

  @IsDateString()
  readonly expirationDate?: string;

  @IsInt({
    message: 'campo "Quantidade mínima" deve ser um número inteiro',
  })
  @IsPositive({
    message: 'campo "Quantidade mínima" deve ser maior que zero',
  })
  readonly lowStock?: number;

  @IsString({
    message: 'O campo "preço" deve estar no formato de texto',
  })
  @IsNumberString({
    no_symbols: true,
  })
  readonly price?: string;

  @IsBoolean()
  readonly disableProduct?: boolean;

  @IsNotEmpty({
    message: 'O campo "usar insumos em estoque é obrigatório"',
  })
  @IsBoolean()
  readonly useStockSupplies: boolean;

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

  readonly productIngredient?: UpdateProductIngredientDTO[];
}
