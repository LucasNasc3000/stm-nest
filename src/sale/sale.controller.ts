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
import { SkipThrottle } from '@nestjs/throttler';
import { SetRoutePolicy } from 'src/auth/decorators/set-route-policy.decorator';
import { SkipCsrf } from 'src/auth/decorators/skip-csrf.decorator';
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

  @SkipCsrf()
  @SkipThrottle({ read: true, auth: true })
  @Post()
  @SetRoutePolicy({ resource: Resource.SALES, action: Action.CREATE })
  Create(
    @Body() body: CreateSaleDTO,
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
  ) {
    return this.salesService.Create(tokenPayloadDTO, body);
  }

  @SkipCsrf()
  @SkipThrottle({ read: true, auth: true })
  @Patch(':id')
  @SetRoutePolicy({ resource: Resource.SALES, action: Action.EDIT_PRICES })
  UpdatePrice(
    @Param('id') id: UrlUuidDTO,
    @Body() updatePriceSaleDTO: UpdatePriceSaleDTO,
  ) {
    return this.salesService.UpdatePrice(id, updatePriceSaleDTO);
  }

  @SkipCsrf()
  @SkipThrottle({ read: true, auth: true })
  @Patch(':id')
  @SetRoutePolicy({ resource: Resource.SALES, action: Action.UPDATE })
  Update(@Param('id') id: UrlUuidDTO, @Body() updateSaleDTO: UpdateSaleDTO) {
    return this.salesService.Update(id, updateSaleDTO);
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/date/')
  @SetRoutePolicy({ resource: Resource.SALES, action: Action.READ })
  FindByDate(@Query() paginationByDateDto: PaginationByDateDTO) {
    return this.salesService.FindByDate(paginationByDateDto);
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/hour/')
  @SetRoutePolicy({ resource: Resource.SALES, action: Action.READ })
  FindByHour(@Query() paginationByHourDto: PaginationByHourDTO) {
    return this.salesService.FindByHour(paginationByHourDto);
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/name/')
  @SetRoutePolicy({ resource: Resource.SALES, action: Action.READ })
  FindByClientName(
    @Query() paginationByClientNameDto: PaginationByClientNameDTO,
  ) {
    return this.salesService.FindByClientName(paginationByClientNameDto);
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/address/')
  @SetRoutePolicy({ resource: Resource.SALES, action: Action.READ })
  FindByAddress(@Query() paginationByAddressDto: PaginationByAddressDTO) {
    return this.salesService.FindByAddress(paginationByAddressDto);
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/employee/')
  @SetRoutePolicy({ resource: Resource.SALES, action: Action.READ })
  FindByEmployee(@Query() paginationByEmployeeDto: PaginationByEmployeeDTO) {
    return this.salesService.FindByEmployee(paginationByEmployeeDto);
  }
}
