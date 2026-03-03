import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  Length,
  ValidateNested
} from 'class-validator';
import { UpdatePermissionDTO } from './update-permission.dto';

export class UpdateRoleDTO {
  @IsOptional()
  @IsString({
    message: 'Campo nome deve estar no formato de texto',
  })
  @Length(0, 100, {
    message: 'Campo "nome" não deve ter mais de 100 caracteres',
  })
  readonly name?: string;

  @IsOptional()
  @IsArray({
    message: 'Permissões deve ser um array',
  })
  @ValidateNested({ each: true })
  @Type(() => UpdatePermissionDTO)
  readonly updatePermissionDTO?: UpdatePermissionDTO[];
}
