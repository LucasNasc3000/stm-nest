import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { SaleReason } from 'src/common/enums/sale-reason.enum';
import { SaleStatus } from 'src/common/enums/sale-status.enum';

export class UpdateSaleDTO {
  @IsOptional()
  @IsString({
    message: 'campo "nome do cliente" deve estar em formato de texto',
  })
  @Length(0, 125, {
    message: 'campo "nome do cliente" deve ter no máximo 125 caracteres',
  })
  readonly clientName?: string;

  @IsOptional()
  @IsString({
    message: 'campo "email" deve estar em formato de texto',
  })
  @IsEmail()
  @Length(13, 50, {
    message: 'O campo "email" deve ter no mínimo 13 e no máximo 50 caracteres',
  })
  readonly clientEmail?: string;

  @IsOptional()
  @IsString({
    message: 'campo "telefone" deve estar em formato de texto',
  })
  @Length(15, 15, {
    message: 'campo "telefone" deve ter estar no formato (00) 00000 0000',
  })
  readonly phoneNumber?: string;

  @IsOptional()
  @IsString({
    message: 'campo "endereço" deve estar em formato de texto',
  })
  @Length(0, 125, {
    message: 'campo "endereço" deve ter no máximo 125 caracteres',
  })
  readonly address?: string;

  @IsOptional()
  @IsEnum(SaleStatus, {
    message: `campo "status" deve ser uma das seguintes opções: ${Object.values(SaleStatus).join(', ')}`,
  })
  readonly status?: SaleStatus;

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
