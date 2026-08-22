import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';
import { IsDecimalString } from 'src/common/decoratos/decimal-string.decorator';
import { SupplyReasonCreate } from 'src/common/enums/supply-history-reason-create.enum';
import { SupplyReason } from 'src/common/enums/supply-history-reason.enum';

export class CreateSupplyDTO {
  @IsNotEmpty({
    message: 'campo "nome" não preenchido',
  })
  @IsString({
    message: 'campo "nome" deve estar em formato de texto',
  })
  @Length(0, 50, {
    message: 'campo "nome" deve ter no máximo 50 caracteres',
  })
  readonly name: string;

  @IsNotEmpty({
    message: 'campo "categoria" não preenchido',
  })
  @IsString({
    message: 'campo "categoria" deve estar em formato de texto',
  })
  @Length(0, 50, {
    message: 'campo "categoria" deve ter no máximo 50 caracteres',
  })
  readonly category: string;

  @IsNotEmpty({
    message: 'campo "quantidade" não preenchido',
  })
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({
    message: 'campo "quantidade" deve ser um número inteiro',
  })
  @IsPositive({
    message: 'campo "quantidade" deve ser maior que zero',
  })
  readonly quantity: number;

  @IsNotEmpty({
    message: 'Campo "preço unitário" não preenchido',
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
  readonly weightPerUnit: string;

  @IsNotEmpty({
    message: 'campo "fornecedor" não preenchido',
  })
  @IsString({
    message: 'campo "fornecedor" deve estar em formato de texto',
  })
  @Length(0, 100, {
    message: 'campo "fornecedor" deve ter no máximo 100 caracteres',
  })
  readonly supplier: string;

  @IsNotEmpty({
    message: 'campo "validade" não preenchido',
  })
  @IsDateString()
  readonly expirationDate: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({
    message: 'campo "Quantidade mínima" deve ser um número inteiro',
  })
  @IsPositive({
    message: 'campo "Quantidade mínima" deve ser maior que zero',
  })
  readonly lowStock?: number;

  @IsNotEmpty({
    message: 'Campo "preço" não preenchido',
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @IsDecimalString({
    message: 'O campo preco deve ser um string decima ex: 59.99',
  })
  readonly price: string;

  // O tipo na propriedade continuou SupplyReason por conveniência.
  // Para criar o regstro precisa ser SupplyReason, a única coisa que muda é
  // o aviso que o front-end vai receber, indicando os motivos de SupplyReasonCreate em vez dos motivos
  // de SupplyReason
  @IsNotEmpty({
    message: 'campo "motivo" não preenchido',
  })
  @IsEnum(SupplyReasonCreate, {
    message: `campo "motivo" deve ser uma das seguintes opções: ${Object.values(SupplyReasonCreate).join(', ')}`,
  })
  readonly reason: SupplyReason;

  @ValidateIf((o) => o.reason !== SupplyReason.ENTRY)
  @IsNotEmpty({
    message: `Descreva quando o motivo não for "entrada"`,
  })
  @Length(12, 600, {
    message: 'campo "detalhes" deve ter no máximo 600 caracteres',
  })
  readonly details?: string;
}
