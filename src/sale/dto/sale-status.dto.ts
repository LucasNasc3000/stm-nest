import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { SaleReason } from 'src/common/enums/sale-reason.enum';
import { SaleStatus } from 'src/common/enums/sale-status.enum';

export class SaleStatusUpdateDTO {
  @IsNotEmpty({
    message: 'campo "status" não preenchido',
  })
  @IsEnum(SaleStatus, {
    message: `campo "status" deve ser uma das seguintes opções: ${Object.values(SaleStatus).join(', ')}`,
  })
  readonly status: SaleStatus;

  @ValidateIf((o) => o.status === SaleStatus.CANCELED)
  @IsBoolean()
  readonly returnToStock?: boolean;

  @ValidateIf((o) => o.status === SaleStatus.CANCELED)
  @IsEnum(SaleReason, {
    message: `campo "motivo" deve ser uma das seguintes opções quando a venda foi cancelada: ${Object.values(SaleReason).join(', ')}`,
  })
  readonly reason?: SaleReason;

  @ValidateIf((o) => o.reason === SaleReason.OTHER)
  @IsNotEmpty({
    message: `Escreva o motivo quando o motivo for ${SaleReason.OTHER}`,
  })
  @IsString()
  @MaxLength(500)
  readonly notes?: string;
}
