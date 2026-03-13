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
import { SupplySearch } from 'src/common/enums/supply-search.enum';

export class PaginationBySupplierDTO {
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
    message: 'campo "fornecedor" não preenchido',
  })
  @IsString({
    message: 'campo "fornecedor" deve estar em formato de texto',
  })
  @Length(0, 150, {
    message: 'campo "fornecedor" deve ter no máximo 150 caracteres',
  })
  value: string;

  @IsNotEmpty({
    message: 'campo "supplySearch" não preenchido',
  })
  @IsEnum(SupplySearch, {
    message: 'Tipo de registro inválido',
  })
  supplyType: SupplySearch;
}
