import {
  IsDateString,
  IsInt,
  IsNumberString,
  IsOptional,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';

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
  @IsInt({
    message: 'campo "quantidade" deve ser um número inteiro',
  })
  @IsPositive({
    message: 'campo "quantidade" deve ser maior que zero',
  })
  readonly quantity?: number;

  @IsOptional()
  @IsString({
    message: 'O campo "preço" deve estar no formato de texto',
  })
  @IsNumberString({
    no_symbols: true,
  })
  readonly totalWeight?: string;

  @IsOptional()
  @IsString({
    message: 'O campo "preço unitário" deve estar no formato de texto',
  })
  @IsNumberString({
    no_symbols: true,
  })
  readonly weightPerUnit?: string;

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
  @IsInt({
    message: 'campo "Quantidade mínima" deve ser um número inteiro',
  })
  @IsPositive({
    message: 'campo "Quantidade mínima" deve ser maior que zero',
  })
  readonly lowStock?: number;

  @IsOptional()
  @IsString({
    message: 'O campo "preço" deve estar no formato de texto',
  })
  @IsNumberString({
    no_symbols: true,
  })
  readonly price?: string;

  @IsOptional()
  @IsString({
    message: 'campo "nome" deve estar em formato de texto',
  })
  @Length(0, 50, {
    message: 'campo "nome" deve ter no máximo 50 caracteres',
  })
  readonly reason?: string;

  @IsOptional()
  @IsString({
    message:
      'O campo "preço total por registro" deve estar no formato de texto',
  })
  @IsNumberString({
    no_symbols: true,
  })
  readonly totalWeightPerRegister?: string;
}
