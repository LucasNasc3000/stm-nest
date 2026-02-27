import { IsBoolean, IsEnum, IsUUID } from 'class-validator';
import { Action, Resource } from 'src/common/enums/permissions.enum';

export class UpdatePermissionDTO {
  @IsUUID(4, {
    message: 'O id da permissão deve ser um uuid',
  })
  readonly id?: string;

  @IsEnum(Action, {
    message: 'Ação inválida',
  })
  readonly action?: Action;

  @IsEnum(Resource, {
    message: 'Recurso inválido',
  })
  readonly resource?: Resource;

  @IsBoolean()
  readonly add?: boolean;

  @IsBoolean()
  readonly take?: boolean;
}
