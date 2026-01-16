import { IsNotEmpty, IsNumberString, IsString, Length } from 'class-validator';
import { CreateSupplyRealtimeDTO } from './create-supply-realtime.dto';

export class CreateSupplyHistoryDTO extends CreateSupplyRealtimeDTO {
  @IsNotEmpty({
    message: 'campo "nome" não preenchido',
  })
  @IsString({
    message: 'campo "nome" deve estar em formato de texto',
  })
  @Length(0, 50, {
    message: 'campo "nome" deve ter no máximo 50 caracteres',
  })
  readonly reason: string;

  @IsNotEmpty({
    message: 'Campo "preço total por registro" não preenchido',
  })
  @IsString({
    message:
      'O campo "preço total por registro" deve estar no formato de texto',
  })
  @IsNumberString({
    no_symbols: true,
  })
  readonly totalWeightPerRegister: string;
}
