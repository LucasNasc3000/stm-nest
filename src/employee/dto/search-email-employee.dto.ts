import { IsEmail, IsNotEmpty } from 'class-validator';

export class SearchByEmailDTO {
  @IsNotEmpty({
    message: 'campo "email" não preenchido',
  })
  @IsEmail(
    {},
    {
      message: 'E-mail inválido',
    },
  )
  readonly value: string;
}
