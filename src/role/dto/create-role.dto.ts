import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
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
  @IsArray({
    message: 'Permissões deve ser um array',
  })
  @ArrayMinSize(1, {
    message: 'Deve haver ao menos uma permissão (Recurso e Ação)',
  })
  @ValidateNested({ each: true }) // <--- ESSENCIAL: Valida cada item do array
  @Type(() => CreatePermissionDTO)
  readonly permissions: CreatePermissionDTO[];
}
