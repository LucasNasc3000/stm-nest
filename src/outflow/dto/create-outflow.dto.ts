import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';
import { OutflowType } from 'src/common/enums/outflow-type.enum';

export class CreateOutflowDTO {
  @IsNotEmpty({
    message: 'campo "data" não preenchido',
  })
  @IsEnum(OutflowType, {
    message: 'Tipo de saída inválido',
  })
  readonly targetType: OutflowType;

  @IsNotEmpty({
    message: 'campo "nome" não preenchido',
  })
  @IsString({
    message: 'campo "nome" deve estar em formato de texto',
  })
  @Length(0, 50, {
    message: 'campo "nome" deve ter no máximo 125 caracteres',
  })
  readonly name: string;

  @IsNotEmpty({
    message: 'campo "categoria" não preenchido',
  })
  @IsString({
    message: 'campo "categoria" deve estar em formato de texto',
  })
  @Length(0, 50, {
    message: 'campo "categoria" deve ter no máximo 100 caracteres',
  })
  readonly category: string;

  @IsNotEmpty({
    message: 'campo "motivo" não preenchido',
  })
  @IsString({
    message: 'campo "motivo" deve estar em formato de texto',
  })
  @Length(0, 50, {
    message: 'campo "motivo" deve ter no máximo 50 caracteres',
  })
  readonly reason: string;

  @IsNotEmpty({
    message: 'campo "unidades" não preenchido',
  })
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({
    message: 'campo "unidades" deve ser um número inteiro',
  })
  @IsPositive({
    message: 'campo "unidades" deve ser maior que zero',
  })
  readonly unities: number;
}
