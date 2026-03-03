import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  Length,
  ValidateNested,
} from 'class-validator';
import { Employee } from '../entities/employee.entity';
import { RoleIdDTO } from './role.dto';

export class CreateEmployeeDTO {
  @IsNotEmpty({
    message: 'campo "email" não preenchido',
  })
  @IsString({
    message: 'campo "email" deve estar em formato de texto',
  })
  @IsEmail()
  @Length(13, 50, {
    message: 'O campo "email" deve ter no mínimo 13 e no máximo 50 caracteres',
  })
  readonly email: string;

  @IsNotEmpty({
    message: 'campo "nome" não preenchido',
  })
  @IsString({
    message: 'campo "nome" deve estar em formato de texto',
  })
  @Length(0, 125, {
    message: 'campo "nome" deve ter no máximo 125 caracteres',
  })
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 2,
    minNumbers: 2,
    minSymbols: 2,
    minUppercase: 2,
  })
  readonly password: string;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => RoleIdDTO)
  readonly role: RoleIdDTO;

  @IsOptional()
  readonly boss?: Employee;

  @IsOptional()
  readonly subordinates?: Employee[];
}
