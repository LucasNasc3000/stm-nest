import {
  IsDateString,
  IsInt,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';

export class UpdateSupplyRealtimeDTO {
  @IsString({
    message: 'campo "nome" deve estar em formato de texto',
  })
  @Length(0, 125, {
    message: 'campo "nome" deve ter no máximo 125 caracteres',
  })
  readonly name?: string;

  @IsString({
    message: 'campo "categoria" deve estar em formato de texto',
  })
  @Length(0, 100, {
    message: 'campo "categoria" deve ter no máximo 100 caracteres',
  })
  readonly category?: string;

  @IsString({
    message: 'campo "fornecedor" deve estar em formato de texto',
  })
  @Length(0, 125, {
    message: 'campo "fornecedor" deve ter no máximo 125 caracteres',
  })
  readonly supplier?: string;

  @IsDateString()
  readonly expirationDate?: string;

  @IsInt({
    message: 'campo "Quantidade mínima" deve ser um número inteiro',
  })
  @IsPositive({
    message: 'campo "Quantidade mínima" deve ser maior que zero',
  })
  readonly lowStock?: number;
}
