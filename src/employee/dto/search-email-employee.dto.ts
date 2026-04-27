import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SearchByEmailDTO {
  @IsNotEmpty({
    message: 'campo "email" não preenchido',
  })
  @IsString({
    message: 'campo "email" deve estar em formato de texto',
  })
  @IsEmail()
  readonly value: string;
}
