import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  ValidateNested,
} from 'class-validator';
import { SaleStatus } from 'src/common/enums/sale-status.enum';
import { SaleItemsDTO } from './sale-items.dto';

export class CreateSaleDTO {
  @IsNotEmpty({
    message: 'campo "nome do cliente" não preenchido',
  })
  @IsString({
    message: 'campo "nome do cliente" deve estar em formato de texto',
  })
  @Length(0, 125, {
    message: 'campo "nome do cliente" deve ter no máximo 125 caracteres',
  })
  readonly clientName: string;

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
  @Matches(/^\(\d{2}\) \d{4,5}-\d{4}$/, {
    message: 'campo "telefone" deve estar no formato (00) 00000-0000',
  })
  @IsString({
    message: 'campo "telefone" deve estar em formato de texto',
  })
  readonly phoneNumber?: string;

  @IsOptional()
  @IsString({
    message: 'campo "endereço" deve estar em formato de texto',
  })
  @Length(8, 125, {
    message: 'campo "endereço" deve ter entre 8 e 125 caracteres',
  })
  readonly address?: string;

  @IsNotEmpty({
    message: 'campo "status" não preenchido',
  })
  @IsEnum(SaleStatus, {
    message: `campo "status" deve ser uma das seguintes opções: ${Object.values(SaleStatus).join(', ')}`,
  })
  readonly status: SaleStatus;

  @IsOptional()
  @IsString({
    message: 'campo "plataforma" deve estar em formato de texto',
  })
  @Length(2, 50, {
    message: 'campo "plataforma" deve ter no máximo 50 caracteres',
  })
  readonly platform: string;

  @IsNotEmpty({
    message: 'campo "itens" não preenchido',
  })
  @IsArray({
    message: 'Ingredientes devem estar em um array',
  })
  @ArrayMinSize(1, { message: 'A venda deve ter ao menos 1 item' })
  @ValidateNested({ each: true })
  @Type(() => SaleItemsDTO)
  readonly saleItems: SaleItemsDTO[];
}
