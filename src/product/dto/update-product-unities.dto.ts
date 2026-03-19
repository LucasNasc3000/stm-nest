import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { OutflowReason } from 'src/common/enums/outflow-reason.enum';

export class UpdateProductUnitiesDTO {
  @IsUUID(4, {
    message: 'O id do produto deve ser um uuid',
  })
  id: string;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({
    message: 'campo "adicionar unidades" deve ser um número inteiro',
  })
  @IsPositive({
    message: 'campo "adicionar unidades" deve ser maior que zero',
  })
  readonly addUnities?: number;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({
    message: 'campo "tirar unidades" deve ser um número inteiro',
  })
  @IsPositive({
    message: 'campo "tirar unidades" deve ser maior que zero',
  })
  readonly takeUnities?: number;

  @IsOptional()
  @IsEnum(OutflowReason, {
    message: `campo motivo deve ser uma das seguintes opções: ${Object.values(OutflowReason).join(', ')}`,
  })
  readonly reason?: OutflowReason;

  @IsOptional()
  @ValidateIf((o) => o.reason === OutflowReason.OTHER)
  @IsNotEmpty({
    message: `Escreva o motivo quando o motivo for ${OutflowReason.OTHER}`,
  })
  @IsString()
  @MaxLength(500)
  readonly notes?: string;
}
