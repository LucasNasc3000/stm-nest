import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, Length, ValidateIf } from 'class-validator';
import { IsDecimalString } from 'src/common/decoratos/decimal-string.decorator';
import { SupplyReason } from 'src/common/enums/supply-history-reason.enum';
import { Employee } from 'src/employee/entities/employee.entity';
import { SupplyRealTime } from '../entities/supply-realtime.entity';
import { CreateSupplyDTO } from './create-supply.dto';

export class CreateSupplyHistoryDTO extends PartialType(CreateSupplyDTO) {
  @IsNotEmpty({
    message: 'Campo "preço" não preenchido',
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @IsDecimalString({
    message: 'O campo preco deve ser um string decima ex: 59.99',
  })
  readonly totalPrice: string;

  @ValidateIf((o) => o.quantity > 0)
  @IsEnum(SupplyReason, {
    message: `campo "motivo" deve ser uma das seguintes opções: ${Object.values(SupplyReason).join(', ')}`,
  })
  readonly reason: SupplyReason;

  @IsNotEmpty({
    message: 'campo "detalhes" deve ser preenchido',
  })
  @Length(12, 600, {
    message: 'campo "detalhes" deve ter no máximo 600 caracteres',
  })
  readonly details: string;

  @IsNotEmpty({
    message: 'Campo "preço total por registro" não preenchido',
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @IsDecimalString({
    message:
      'O campo "peso total por registro" deve ser um string decimal ex: 59.99',
  })
  readonly totalWeightPerRegister: string;

  @IsNotEmpty()
  readonly supplyRealTime: SupplyRealTime;

  @IsNotEmpty()
  readonly employee: Employee;
}
