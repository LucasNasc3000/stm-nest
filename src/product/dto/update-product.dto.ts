import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { OutflowReason } from 'src/common/enums/outflow-reason.enum';
import { AddProductIngredientDTO } from './add-product-ingredient.dto';
import { UpdateProductIngredientDTO } from './update-product-ingredient.dto';

export class UpdateProductDTO {
  @IsOptional()
  @IsString({
    message: 'campo "nome" deve estar em formato de texto',
  })
  @Length(0, 50, {
    message: 'campo "nome" deve ter no máximo 50 caracteres',
  })
  readonly name?: string;

  @IsOptional()
  @IsString({
    message: 'campo "categoria" deve estar em formato de texto',
  })
  @Length(0, 50, {
    message: 'campo "categoria" deve ter no máximo 50 caracteres',
  })
  readonly category?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({
    message: 'campo "unidades" deve ser um número inteiro',
  })
  @IsPositive({
    message: 'campo "unidades" deve ser maior que zero',
  })
  readonly unities?: number;

  @IsOptional()
  @IsDateString()
  readonly expirationDate?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({
    message: 'campo "Quantidade mínima" deve ser um número inteiro',
  })
  @IsPositive({
    message: 'campo "Quantidade mínima" deve ser maior que zero',
  })
  readonly lowStock?: number;

  @IsOptional()
  @IsBoolean()
  readonly is_active?: boolean;

  @IsOptional()
  @IsBoolean()
  readonly disableProduct?: boolean;

  @ValidateIf((o) => o.addUnities > 0)
  @IsNotEmpty({
    message: 'O campo "usar insumos em estoque é obrigatório"',
  })
  @IsBoolean()
  readonly useStockSupplies?: boolean;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({
    message: 'campo "adicionar unidades" deve ser um número inteiro',
  })
  @IsPositive({
    message: 'campo "adicionar unidades" deve ser maior que zero',
  })
  readonly addUnities?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({
    message: 'campo "tirar unidades" deve ser um número inteiro',
  })
  @IsPositive({
    message: 'campo "tirar unidades" deve ser maior que zero',
  })
  readonly takeUnities?: number;

  @ValidateIf((o) => o.takeUnities > 0)
  @IsNotEmpty({
    message: 'campo "motivo" não preenchido',
  })
  @IsEnum(OutflowReason, {
    message: `campo motivo deve ser uma das seguintes opções: ${Object.values(OutflowReason).join(', ')}`,
  })
  readonly reason?: OutflowReason;

  @ValidateIf((o) => o.reason === OutflowReason.OTHER)
  @IsNotEmpty({
    message: `Escreva o motivo quando o motivo for ${OutflowReason.OTHER}`,
  })
  @IsString()
  @MaxLength(500)
  readonly notes?: string;

  @IsOptional()
  @IsArray({
    message: 'Ingredientes devem estar em um array',
  })
  @ArrayMinSize(1, { message: 'A receita deve ter ao menos 1 produto' })
  @ValidateNested({ each: true })
  @Type(() => UpdateProductIngredientDTO)
  readonly updateProductIngredient?: UpdateProductIngredientDTO[];

  @IsOptional()
  @IsArray({
    message: 'Ingredientes devem estar em um array',
  })
  @ArrayMinSize(1, { message: 'A receita deve ter ao menos 1 produto' })
  @ValidateNested({ each: true })
  @Type(() => AddProductIngredientDTO)
  readonly addproductIngredient?: AddProductIngredientDTO[];
}
