import { IsString, Length } from 'class-validator';

export class UpdateSaleDTO {
  @IsString({
    message: 'campo "nome do cliente" deve estar em formato de texto',
  })
  @Length(0, 125, {
    message: 'campo "nome do cliente" deve ter no máximo 125 caracteres',
  })
  readonly clientName?: string;

  @IsString({
    message: 'campo "telefone" deve estar em formato de texto',
  })
  @Length(15, 15, {
    message: 'campo "telefone" deve ter estar no formato (00) 00000 0000',
  })
  readonly phoneNumber?: string;

  @IsString({
    message: 'campo "endereço" deve estar em formato de texto',
  })
  @Length(0, 125, {
    message: 'campo "endereço" deve ter no máximo 125 caracteres',
  })
  readonly address?: string;
}
