import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SetRoutePolicy } from 'src/auth/decorators/set-route-policy.decorator';
import { TokenPayloadDTO } from 'src/auth/dto/token-payload.dto';
import { RoutePolicyGuard } from 'src/auth/guards/route-policy.guard';
import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
import { UrlUuidDTO } from 'src/common/dto/url-uuid.dto';
import { Action, Resource } from 'src/common/enums/permissions.enum';
import { CreateSaleDTO } from './dto/create-sale.dto';
import { PaginationByAddressDTO } from './dto/pagination-address.dto';
import { PaginationByClientNameDTO } from './dto/pagination-client-name.dto';
import { PaginationByDateDTO } from './dto/pagination-date.dto';
import { PaginationByEmployeeDTO } from './dto/pagination-employee.dto';
import { PaginationByHourDTO } from './dto/pagination-hour.dto';
import { UpdatePriceSaleDTO } from './dto/update-price-sale.dto';
import { UpdateSaleDTO } from './dto/update-sale.dto';
import { SaleService } from './sale.service';

@UseGuards(RoutePolicyGuard)
@Controller('sales')
export class SaleController {
  constructor(private readonly salesService: SaleService) {}

  @Post()
  @SetRoutePolicy({ resource: Resource.SALES, action: Action.CREATE })
  Create(
    @Body() body: CreateSaleDTO,
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
  ) {
    return this.salesService.Create(tokenPayloadDTO, body);
  }

  @Patch(':id')
  @SetRoutePolicy({ resource: Resource.SALES, action: Action.EDIT_PRICES })
  UpdatePrice(
    @Param('id') id: UrlUuidDTO,
    @Body() updatePriceSaleDTO: UpdatePriceSaleDTO,
  ) {
    return this.salesService.UpdatePrice(id, updatePriceSaleDTO);
  }

  @Patch(':id')
  @SetRoutePolicy({ resource: Resource.SALES, action: Action.UPDATE })
  Update(@Param('id') id: UrlUuidDTO, @Body() updateSaleDTO: UpdateSaleDTO) {
    return this.salesService.Update(id, updateSaleDTO);
  }

  @Get('search/date/')
  @SetRoutePolicy({ resource: Resource.SALES, action: Action.READ })
  FindByDate(@Query() paginationByDateDto: PaginationByDateDTO) {
    return this.salesService.FindByDate(paginationByDateDto);
  }

  @Get('search/hour/')
  @SetRoutePolicy({ resource: Resource.SALES, action: Action.READ })
  FindByHour(@Query() paginationByHourDto: PaginationByHourDTO) {
    return this.salesService.FindByHour(paginationByHourDto);
  }

  @Get('search/name/')
  @SetRoutePolicy({ resource: Resource.SALES, action: Action.READ })
  FindByClientName(
    @Query() paginationByClientNameDto: PaginationByClientNameDTO,
  ) {
    return this.salesService.FindByClientName(paginationByClientNameDto);
  }

  @Get('search/address/')
  @SetRoutePolicy({ resource: Resource.SALES, action: Action.READ })
  FindByAddress(@Query() paginationByAddressDto: PaginationByAddressDTO) {
    return this.salesService.FindByAddress(paginationByAddressDto);
  }

  @Get('search/employee/')
  @SetRoutePolicy({ resource: Resource.SALES, action: Action.READ })
  FindByEmployee(@Query() paginationByEmployeeDto: PaginationByEmployeeDTO) {
    return this.salesService.FindByEmployee(paginationByEmployeeDto);
  }
}
