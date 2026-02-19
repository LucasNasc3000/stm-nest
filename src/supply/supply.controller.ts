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
import { TokenPayloadDTO } from 'src/auth/dto/token-payload.dto';
import { RoutePolicyGuard } from 'src/auth/guards/route-policy.guard';
import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
import { UrlUuidDTO } from 'src/common/dto/url-uuid.dto';
import { Action, Resource } from 'src/common/enums/permissions.enum';
import { CreateSupplyDTO } from './dto/create-supply.dto';
import { PaginationByCategoryDTO } from './dto/pagination-category.dto';
import { PaginationByEmployeeDTO } from './dto/pagination-employee.dto';
import { PaginationByExpDateDTO } from './dto/pagination-exp-date.dto';
import { PaginationByNameDTO } from './dto/pagination-name.dto';
import { PaginationByPriceDTO } from './dto/pagination-price.dto';
import { PaginationBySupplierDTO } from './dto/pagination-supplier.dto';
import { SearchByWeightPerUnitDTO } from './dto/pagination-weightperunit.dto';
import { UpdatePriceSupplyRealtimeDTO } from './dto/update-price-supply-realtime.dto';
import { UpdateSupplyRealtimeDTO } from './dto/update-supply-realtime.dto';
import { SupplyService } from './supply.service';

@UseGuards(RoutePolicyGuard)
@Controller('supplies')
export class SupplyController {
  constructor(private readonly supplyService: SupplyService) {}

  @SkipThrottle({ read: true, auth: true })
  @Post()
  @SetRoutePolicy({ resource: Resource.SUPPLIES, action: Action.CREATE })
  Create(
    @Body() body: CreateSupplyDTO,
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
  ) {
    return this.supplyService.Create(body, tokenPayloadDTO);
  }

  @SkipThrottle({ read: true, auth: true })
  @Patch(':id')
  @SetRoutePolicy({ resource: Resource.SUPPLIES, action: Action.UPDATE })
  Update(
    @Param('id') id: UrlUuidDTO,
    @Body() updateSupplyRealtimeDTO: UpdateSupplyRealtimeDTO,
  ) {
    return this.supplyService.Update(id, updateSupplyRealtimeDTO);
  }

  @SkipThrottle({ read: true, auth: true })
  @Patch(':id')
  @SetRoutePolicy({ resource: Resource.SUPPLIES, action: Action.EDIT_PRICES })
  UpdatePrice(
    @Param('id') id: UrlUuidDTO,
    @Body() updateSupplyRealtimePriceDTO: UpdatePriceSupplyRealtimeDTO,
  ) {
    return this.supplyService.UpdatePrice(id, updateSupplyRealtimePriceDTO);
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/id/:id')
  @SetRoutePolicy({ resource: Resource.SUPPLIES, action: Action.READ })
  FindById(@Param('id') id: UrlUuidDTO) {
    return this.supplyService.FindById(id);
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/supplier/')
  @SetRoutePolicy({ resource: Resource.SUPPLIES, action: Action.READ })
  FindBySupplier(@Query() paginationBySupplierDto: PaginationBySupplierDTO) {
    return this.supplyService.FindBySupplier(paginationBySupplierDto);
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/name/')
  @SetRoutePolicy({ resource: Resource.SUPPLIES, action: Action.READ })
  FindByName(@Query() paginationByNameDto: PaginationByNameDTO) {
    return this.supplyService.FindByName(paginationByNameDto);
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/category/')
  @SetRoutePolicy({ resource: Resource.SUPPLIES, action: Action.READ })
  FindByCategory(@Query() paginationByCategoryDto: PaginationByCategoryDTO) {
    return this.supplyService.FindByCategory(paginationByCategoryDto);
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/price/')
  @SetRoutePolicy({ resource: Resource.SUPPLIES, action: Action.READ })
  FindByPrice(@Query() paginationByPriceDto: PaginationByPriceDTO) {
    return this.supplyService.FindByPrice(paginationByPriceDto);
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/weightPerUnit/:weightPerUnit')
  @SetRoutePolicy({ resource: Resource.SUPPLIES, action: Action.READ })
  FindByWeightPerUnit(
    @Param('weightPerUnit')
    searchByWeightPerUnitDto: SearchByWeightPerUnitDTO,
  ) {
    return this.supplyService.FindByWeightPerUnit(searchByWeightPerUnitDto);
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/employee/')
  @SetRoutePolicy({ resource: Resource.SUPPLIES, action: Action.READ })
  FindByEmployee(@Query() paginationByEmployeeDto: PaginationByEmployeeDTO) {
    return this.supplyService.FindByEmployee(paginationByEmployeeDto);
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/expirationDate/')
  @SetRoutePolicy({ resource: Resource.SUPPLIES, action: Action.READ })
  FindByExpirationDate(
    @Query() paginationByExpDateDto: PaginationByExpDateDTO,
  ) {
    return this.supplyService.FindByExpirationDate(paginationByExpDateDto);
  }
}
