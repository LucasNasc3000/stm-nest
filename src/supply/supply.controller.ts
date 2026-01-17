import { Controller } from '@nestjs/common';
import { SupplyService } from './supply.service';

@Controller('supplies')
export class SupplyController {
  constructor(private readonly supplyService: SupplyService) {}
}
