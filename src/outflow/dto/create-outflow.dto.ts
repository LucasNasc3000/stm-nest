import { IsDateString, IsNotEmpty } from 'class-validator';

export class CreateOutflowDTO {
  @IsNotEmpty({
    message: 'campo "data" não preenchido',
  })
  @IsDateString()
  readonly date: string;
}
