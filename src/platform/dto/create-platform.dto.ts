import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { IsDecimalString } from 'src/common/decoratos/decimal-string.decorator';

export class CreatePlatformDTO {
  @IsNotEmpty({
    message: 'campo "nome" não preenchido',
  })
  @IsString({
    message: 'campo "nome" deve estar em formato de texto',
  })
  @Length(2, 50, {
    message: 'campo "nome" deve ter no máximo 50 caracteres',
  })
  readonly name: string;

  @IsNotEmpty({
    message: 'Campo "taxa" não preenchido',
  })
  @Transform(({ value }) => {
    if (value === undefined || value === null) {
      return value;
    }
    return typeof value === 'string' ? value.trim() : value;
  })
  @IsDecimalString({
    message: 'O campo "taxa" deve ser um string decimal ex: 59.99',
  })
  readonly taxPercentage: string;
}
