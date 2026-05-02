import { IsNotEmpty, IsUUID } from 'class-validator';

export class UrlUuidDTO {
  @IsNotEmpty({
    message: 'Id não fornecido',
  })
  @IsUUID(4, {
    message: 'O id do funcionário deve ser um uuid',
  })
  id: string;
}
