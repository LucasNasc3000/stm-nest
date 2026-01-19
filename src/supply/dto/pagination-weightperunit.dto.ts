import { IsNotEmpty, IsNumberString } from 'class-validator';

export class SearchByWeightPerUnitDTO {
  @IsNotEmpty({
    message: 'campo "peso unitário" não preenchido',
  })
  @IsNumberString()
  weightPerUnit: string;
}
