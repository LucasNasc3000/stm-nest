import { IsNotEmpty, IsString, Length } from 'class-validator';
import { CreatePermissionDTO } from './create-permission.dto';

export class CreateRoleDTO {
  @IsNotEmpty({
    message: 'Campo "nome" não preenchido',
  })
  @IsString({
    message: 'Campo nome deve estar no formato de texto',
  })
  @Length(0, 100, {
    message: 'Campo "nome" não deve ter mais de 100 caracteres',
  })
  readonly name: string;

  @IsNotEmpty({
    message: 'Campo "permissões" não preenchido',
  })
  readonly permissions: CreatePermissionDTO[];
}
