import { Transform } from 'class-transformer';
import {
  IsBoolean,
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
import { SupplyReason } from 'src/common/enums/supply-history-reason.enum';

export class UpdateSupplyRealtimeDTO {
  @IsOptional()
  @IsString({
    message: 'campo "nome" deve estar em formato de texto',
  })
  @Length(0, 125, {
    message: 'campo "nome" deve ter no máximo 125 caracteres',
  })
  readonly name?: string;

  @IsOptional()
  @IsString({
    message: 'campo "categoria" deve estar em formato de texto',
  })
  @Length(0, 100, {
    message: 'campo "categoria" deve ter no máximo 100 caracteres',
  })
  readonly category?: string;

  @IsOptional()
  @IsString({
    message: 'campo "fornecedor" deve estar em formato de texto',
  })
  @Length(0, 125, {
    message: 'campo "fornecedor" deve ter no máximo 125 caracteres',
  })
  readonly supplier?: string;

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

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @IsDecimalString({
    message: 'O campo "peso unitário" deve ser um string decimal ex: 59.99',
  })
  readonly weightPerUnit?: string;

  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;

  @IsNotEmpty({
    message: 'campo "motivo" não preenchido',
  })
  @IsEnum(SupplyReason, {
    message: `campo "motivo" deve ser uma das seguintes opções: ${Object.values(SupplyReason).join(', ')}`,
  })
  readonly reason: SupplyReason;

  @IsNotEmpty({
    message: 'campo "detalhes" deve ser preenchido',
  })
  @IsString()
  @Length(12, 600, {
    message: 'campo "detalhes" deve ter no máximo 600 caracteres',
  })
  readonly details: string;
}
