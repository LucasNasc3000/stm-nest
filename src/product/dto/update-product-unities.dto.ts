import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { OutflowReason } from 'src/common/enums/outflow-reason.enum';
import { ProductInflowReason } from 'src/common/enums/product-inflow-reason.enum';

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

  @ValidateIf((o) => o.addUnities > 0)
  @IsNotEmpty({
    message: 'campo "motivo" não preenchido',
  })
  @IsEnum(OutflowReason, {
    message: `campo motivo deve ser uma das seguintes opções: ${Object.values(ProductInflowReason).join(', ')}`,
  })
  readonly addUnitiesReason?: ProductInflowReason;

  @ValidateIf((o) => o.takeUnities > 0)
  @IsNotEmpty({
    message: 'campo "motivo" não preenchido',
  })
  @IsEnum(OutflowReason, {
    message: `campo motivo deve ser uma das seguintes opções: ${Object.values(OutflowReason).join(', ')}`,
  })
  readonly takeUnitiesReason?: OutflowReason;

  @ValidateIf(
    (o) =>
      o.takeUnitiesReason === OutflowReason.OTHER ||
      o.addUnitiesReason === ProductInflowReason.OTHER,
  )
  @IsNotEmpty({
    message: `Escreva o motivo quando o motivo for ${OutflowReason.OTHER}`,
  })
  @IsString()
  @MaxLength(500)
  readonly notes?: string;
}
