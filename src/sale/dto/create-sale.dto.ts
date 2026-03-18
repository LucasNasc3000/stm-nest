import { Transform } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsString, Length } from 'class-validator';
import { IsDecimalString } from 'src/common/decoratos/decimal-string.decorator';
import { SaleItemsDTO } from './sale-items.dto';

export class CreateSaleDTO {
  @IsNotEmpty({
    message: 'campo "data" não preenchido',
  })
  @IsDateString()
  readonly date: string;

  @IsNotEmpty({
    message: 'campo "hora" não preenchido',
  })
  readonly hour: string;

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

  @IsNotEmpty({
    message: 'campo "telefone" não preenchido',
  })
  @IsString({
    message: 'campo "telefone" deve estar em formato de texto',
  })
  @Length(15, 15, {
    message: 'campo "telefone" deve ter estar no formato (00) 00000 0000',
  })
  readonly phoneNumber: string;

  @IsNotEmpty({
    message: 'campo "endereço" não preenchido',
  })
  @IsString({
    message: 'campo "endereço" deve estar em formato de texto',
  })
  @Length(0, 125, {
    message: 'campo "endereço" deve ter no máximo 125 caracteres',
  })
  readonly address: string;

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

  readonly saleItems: SaleItemsDTO[];
}
