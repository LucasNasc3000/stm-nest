import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';
import { IsDecimalString } from 'src/common/decoratos/decimal-string.decorator';
import { ProductInflowReason } from 'src/common/enums/product-inflow-reason.enum';

export class CreateProductWithoutRecipeDTO {
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
  @IsPositive({
    message: 'campo "unidades" deve ser maior que zero',
  })
  readonly unities: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
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
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @IsDecimalString({
    message: 'O campo "preco" deve ser um string decimal ex: 59.99',
  })
  readonly price: string;

  @IsNotEmpty({
    message: 'campo "validade" não preenchido',
  })
  @IsDateString()
  readonly expirationDate: string;

  @IsNotEmpty({
    message: 'campo "motivo" não preenchido',
  })
  @IsEnum(ProductInflowReason, {
    message: `campo motivo deve ser uma das seguintes opções: ${Object.values(ProductInflowReason).join(', ')}`,
  })
  readonly reason: ProductInflowReason;
}
