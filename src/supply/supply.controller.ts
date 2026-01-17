import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { SetRoutePolicy } from 'src/auth/decorators/set-route-policy.decorator';
import { TokenPayloadDTO } from 'src/auth/dto/token-payload.dto';
import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
import { UrlUuidDTO } from 'src/common/dto/url-uuid.dto';
import { EmployeeRole } from 'src/common/enums/employee-role.enum';
import { CreateSupplyDTO } from './dto/create-supply.dto';
import { UpdatePriceSupplyRealtimeDTO } from './dto/update-price-supply-realtime.dto';
import { UpdateSupplyRealtimeDTO } from './dto/update-supply-realtime.dto';
import { SupplyService } from './supply.service';

@Controller('supplies')
export class SupplyController {
  constructor(private readonly supplyService: SupplyService) {}

  @Post()
  @SetRoutePolicy(EmployeeRole.CREATE)
  @SetRoutePolicy(EmployeeRole.SUPPLIES)
  Create(
    @Body() body: CreateSupplyDTO,
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
  ) {
    return this.supplyService.Create(body, tokenPayloadDTO);
  }

  @Patch()
  @SetRoutePolicy(EmployeeRole.UPDATE)
  @SetRoutePolicy(EmployeeRole.SUPPLIES)
  Update(
    @Param('id') id: UrlUuidDTO,
    @Body() updateSupplyRealtimeDTO: UpdateSupplyRealtimeDTO,
  ) {
    return this.supplyService.Update(id, updateSupplyRealtimeDTO);
  }

  @Patch()
  @SetRoutePolicy(EmployeeRole.UPDATE)
  @SetRoutePolicy(EmployeeRole.EDIT_PRICES)
  @SetRoutePolicy(EmployeeRole.SUPPLIES)
  UpdatePrice(
    @Param('id') id: UrlUuidDTO,
    @Body() updateSupplyRealtimePriceDTO: UpdatePriceSupplyRealtimeDTO,
  ) {
    return this.supplyService.UpdatePrice(id, updateSupplyRealtimePriceDTO);
  }
}
