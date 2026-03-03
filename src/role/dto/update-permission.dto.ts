import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { Action, Resource } from 'src/common/enums/permissions.enum';

export class UpdatePermissionDTO {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  readonly id: number;

  @IsOptional()
  @IsEnum(Action, {
    message: 'Ação inválida',
  })
  readonly action?: Action;

  @IsOptional()
  @IsEnum(Resource, {
    message: 'Recurso inválido',
  })
  readonly resource?: Resource;

  @IsOptional()
  @IsBoolean()
  readonly add?: boolean;

  @IsOptional()
  @IsBoolean()
  readonly take?: boolean;
}
