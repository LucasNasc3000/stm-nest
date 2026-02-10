import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsPositive, IsUUID } from 'class-validator';
import { IsDecimalString } from 'src/common/decoratos/decimal-string.decorator';

export class SaleItemsDTO {
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

  @IsNotEmpty({
    message: 'Id do produto não fornecido',
  })
  @IsUUID(4, {
    message: 'O id do produto deve ser um uuid',
  })
  product: string;
}
