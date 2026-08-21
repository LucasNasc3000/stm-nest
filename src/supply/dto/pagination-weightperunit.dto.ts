import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, Max, Min } from 'class-validator';
import { IsDecimalString } from 'src/common/decoratos/decimal-string.decorator';
import { SupplySearch } from 'src/common/enums/supply-search.enum';

export class PaginationByWeightPerUnitDTO {
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
    message: 'Peso unitário não informado',
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @IsDecimalString({
    message: 'O campo "peso unitário" deve ser um string decimal ex: 59.99',
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
