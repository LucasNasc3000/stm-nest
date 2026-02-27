import { IsEnum, IsNotEmpty } from 'class-validator';
import { Action, Resource } from 'src/common/enums/permissions.enum';

export class CreatePermissionDTO {
  @IsNotEmpty({
    message: 'Campo "ação" não preenchido',
  })
  @IsEnum(Action, {
    message: 'Ação inválida',
  })
  readonly action: Action;

  @IsNotEmpty({
    message: 'Campo "recurso" não preenchido',
  })
  @IsEnum(Resource, {
    message: 'Recurso inválido',
  })
  readonly resource: Resource;
}
