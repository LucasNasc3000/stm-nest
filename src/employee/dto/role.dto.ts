import { IsNotEmpty, IsString, IsUUID, Length } from 'class-validator';

export class RoleIdDTO {
  @IsNotEmpty({
    message: 'Id do cargo não fornecido',
  })
  @IsUUID(4, {
    message: 'O id do cargo deve ser um uuid',
  })
  roleId: string;

  @IsNotEmpty({
    message: 'campo "nome" não preenchido',
  })
  @IsString({
    message: 'campo "nome" deve estar em formato de texto',
  })
  @Length(0, 100, {
    message: 'campo "nome" deve ter no máximo 100 caracteres',
  })
  readonly name: string;
}
