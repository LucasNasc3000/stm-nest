import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  Length,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { IsDecimalString } from 'src/common/decoratos/decimal-string.decorator';
import { OutflowReason } from 'src/common/enums/outflow-reason.enum';
import { OutflowType } from 'src/common/enums/outflow-type.enum';

export class CreateOutflowDTO {
  @IsNotEmpty({
    message: 'campo "tipo de saída" não preenchido',
  })
  @IsEnum(OutflowType, {
    message: 'Tipo de saída inválido',
  })
  readonly targetType: OutflowType;

  @IsNotEmpty({
    message: 'campo "nome" não preenchido',
  })
  @IsString({
    message: 'campo "nome" deve estar em formato de texto',
  })
  @Length(0, 50, {
    message: 'campo "nome" deve ter no máximo 125 caracteres',
  })
  readonly name: string;

  @IsNotEmpty({
    message: 'campo "categoria" não preenchido',
  })
  @IsString({
    message: 'campo "categoria" deve estar em formato de texto',
  })
  @Length(0, 50, {
    message: 'campo "categoria" deve ter no máximo 100 caracteres',
  })
  readonly category: string;

  @IsNotEmpty({
    message: 'campo "motivo" não preenchido',
  })
  @IsEnum(OutflowReason, {
    message: `campo motivo deve ser uma das seguintes opções: ${Object.values(OutflowReason).join(', ')}`,
  })
  readonly reason: OutflowReason;

  @ValidateIf((o) => o.targetType === OutflowType.PRODUCT)
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({
    message: 'campo "unidades" deve ser um número inteiro',
  })
  @IsPositive({
    message: 'campo "unidades" deve ser maior que zero',
  })
  readonly unities?: number;

  @ValidateIf((o) => o.targetType === OutflowType.SUPPLY)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @IsDecimalString({
    message: 'O campo quantidade deve ser um string decimal ex: 59.99',
  })
  readonly quantity?: string;

  @IsNotEmpty({
    message: 'Campo "unidade de insumo" não preenchido',
  })
  @IsBoolean({
    message: 'O campo "unidade de insumo" deve ser booleano',
  })
  readonly isUnitForSupply?: boolean;

  @ValidateIf((o) => o.reason === OutflowReason.OTHER)
  @IsNotEmpty({
    message: `Escreva o motivo quando o motivo for ${OutflowReason.OTHER}`,
  })
  @MaxLength(500, {
    message: 'Os detalhes não devem passar dos 500 caracteres',
  })
  readonly notes?: string;
}
