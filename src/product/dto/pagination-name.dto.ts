import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { ProductSearch } from 'src/common/enums/product-search.enum';

export class PaginationByNameDTO {
  @IsInt({
    message: 'Limite precisa ser um numero inteiro',
  })
  @Min(0, {
    message: 'Limite não pode ser menor que 0',
  })
  @Max(20, {
    message: 'Limite não pode ser maior que 20',
  })
  @Type(() => Number)
  limit: number;

  @IsInt({
    message: 'Offset precisa ser um numero inteiro',
  })
  @Min(0, {
    message: 'Offset não deve ser menor que 0',
  })
  @Type(() => Number)
  offset: number;

  @IsNotEmpty({
    message: 'campo "nome" não preenchido',
  })
  @IsString({
    message: 'campo "nome" deve estar em formato de texto',
  })
  @Length(0, 50, {
    message: 'campo "nome" deve ter no máximo 50 caracteres',
  })
  value: string;

  @IsNotEmpty({
    message: 'campo "productSearch" não preenchido',
  })
  @IsEnum(ProductSearch, {
    message: 'Tipo de registro inválido',
  })
  productType: ProductSearch;

  @IsNotEmpty({
    message: 'campo "para exibição" não preenchido',
  })
  @Type(() => Boolean)
  forDisplay: boolean;
}
