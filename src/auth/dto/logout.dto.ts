import { IsEmail, IsNotEmpty } from 'class-validator';

export class LogoutDTO {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
