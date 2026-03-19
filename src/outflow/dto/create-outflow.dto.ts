import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { OutflowReason } from 'src/common/enums/outflow-reason.enum';
import { OutflowType } from 'src/common/enums/outflow-type.enum';

export class CreateOutflowDTO {
  @IsNotEmpty({
    message: 'campo "data" não preenchido',
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
  @ValidateIf((o) => o.reason === OutflowReason.OTHER)
  @IsNotEmpty({
    message: `Escreva o motivo quando o motivo for ${OutflowReason.OTHER}`,
  })
  @IsString()
  @MaxLength(500)
  readonly notes?: string;
}
