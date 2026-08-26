import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  Max,
  Min,
} from 'class-validator';
import { SupplySearch } from 'src/common/enums/supply-search.enum';

export class PaginationByExpDateDTO {
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
    message: 'campo "supplySearch" não preenchido',
  })
  @IsEnum(SupplySearch, {
    message: 'Tipo de registro inválido',
  })
  supplyType: SupplySearch;

  @IsNotEmpty({
    message: 'campo "data" não preenchido',
  })
  @IsDateString(
    {},
    {
      message: 'Formato de data inválido',
    },
  )
  value: string;
}
