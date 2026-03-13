import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsUUID, Max, Min } from 'class-validator';
import { SupplySearch } from 'src/common/enums/supply-search.enum';

export class PaginationByEmployeeDTO {
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
    message: 'Id do funcionário não fornecido',
  })
  @IsUUID(4, {
    message: 'Id do funcionário deve ser um uuid',
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
