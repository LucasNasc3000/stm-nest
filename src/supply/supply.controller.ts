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
import { Action, Resource } from 'src/common/enums/permissions.enum';
import { CreateSupplyDTO } from './dto/create-supply.dto';
import { PaginationByCategoryDTO } from './dto/pagination-category.dto';
import { PaginationByDateDTO } from './dto/pagination-date.dto';
import { PaginationByEmployeeDTO } from './dto/pagination-employee.dto';
import { PaginationByExpDateDTO } from './dto/pagination-exp-date.dto';
import { PaginationByNameDTO } from './dto/pagination-name.dto';
import { PaginationByPriceDTO } from './dto/pagination-price.dto';
import { PaginationByReasonDTO } from './dto/pagination-reason.dto';
import { PaginationBySupplierDTO } from './dto/pagination-supplier.dto';
import { PaginationByTotalWeightDTO } from './dto/pagination-totalweight.dto';
import { PaginationByWeightPerUnitDTO } from './dto/pagination-weightperunit.dto';
import { UpdatePriceSupplyRealtimeDTO } from './dto/update-price-supply-realtime.dto';
import { UpdateSupplyRealtimeDTO } from './dto/update-supply-realtime.dto';
import { SupplyFindService } from './supply-find.service';
import { SupplyService } from './supply.service';

@UseGuards(RoutePolicyGuard)
@Controller('supplies')
export class SupplyController {
  constructor(
    private readonly supplyService: SupplyService,
    private readonly supplyFindService: SupplyFindService,
  ) {}

  @SkipCsrf()
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
  @Patch('update/:id')
  @SetRoutePolicy({ resource: Resource.SUPPLIES, action: Action.UPDATE })
  Update(
    @Param('id') id: string,
    @Body() updateSupplyRealtimeDTO: UpdateSupplyRealtimeDTO,
  ) {
    return this.supplyService.Update(id, updateSupplyRealtimeDTO);
  }

  @SkipThrottle({ read: true, auth: true })
  @Patch('update/price/:id')
  @SetRoutePolicy({ resource: Resource.SUPPLIES, action: Action.EDIT_PRICES })
  UpdatePrice(
    @Param('id') id: string,
    @Body() updateSupplyRealtimePriceDTO: UpdatePriceSupplyRealtimeDTO,
  ) {
    return this.supplyService.UpdatePrice(id, updateSupplyRealtimePriceDTO);
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/id/supplyRealTime/:id')
  @SetRoutePolicy({ resource: Resource.SUPPLIES, action: Action.READ })
  FindByIdSupplyRealTime(@Param('id') id: string) {
    return this.supplyFindService.FindByIdSupplyRealTime(id);
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/id/supplyHistory/:id')
  @SetRoutePolicy({ resource: Resource.SUPPLIES, action: Action.READ })
  FindByIdSupplyHistory(@Param('id') id: string) {
    return this.supplyFindService.FindByIdSupplyHistory(id);
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/supplier/')
  @SetRoutePolicy({ resource: Resource.SUPPLIES, action: Action.READ })
  FindBySupplier(@Query() paginationBySupplierDto: PaginationBySupplierDTO) {
    return this.supplyFindService.FindBySupplier(paginationBySupplierDto);
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/name/')
  @SetRoutePolicy({ resource: Resource.SUPPLIES, action: Action.READ })
  FindByName(@Query() paginationByNameDto: PaginationByNameDTO) {
    return this.supplyFindService.FindByName(paginationByNameDto);
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/category/')
  @SetRoutePolicy({ resource: Resource.SUPPLIES, action: Action.READ })
  FindByCategory(@Query() paginationByCategoryDto: PaginationByCategoryDTO) {
    return this.supplyFindService.FindByCategory(paginationByCategoryDto);
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/price/')
  @SetRoutePolicy({ resource: Resource.SUPPLIES, action: Action.READ })
  FindByPrice(@Query() paginationByPriceDto: PaginationByPriceDTO) {
    return this.supplyFindService.FindByPrice(paginationByPriceDto);
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/totalPrice/')
  @SetRoutePolicy({ resource: Resource.SUPPLIES, action: Action.READ })
  FindByTotalPrice(@Query() paginationByPriceDto: PaginationByPriceDTO) {
    return this.supplyFindService.FindByTotalPrice(paginationByPriceDto);
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/weightPerUnit/')
  @SetRoutePolicy({ resource: Resource.SUPPLIES, action: Action.READ })
  FindByWeightPerUnit(
    @Query() paginationByWeightPerUnitDto: PaginationByWeightPerUnitDTO,
  ) {
    return this.supplyFindService.FindByWeightPerUnit(
      paginationByWeightPerUnitDto,
    );
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/employee/')
  @SetRoutePolicy({ resource: Resource.SUPPLIES, action: Action.READ })
  FindByEmployee(@Query() paginationByEmployeeDto: PaginationByEmployeeDTO) {
    return this.supplyFindService.FindByEmployee(paginationByEmployeeDto);
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/expirationDate/')
  @SetRoutePolicy({ resource: Resource.SUPPLIES, action: Action.READ })
  FindByExpirationDate(
    @Query() paginationByExpDateDto: PaginationByExpDateDTO,
  ) {
    return this.supplyFindService.FindByExpirationDate(paginationByExpDateDto);
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/date/')
  @SetRoutePolicy({ resource: Resource.SUPPLIES, action: Action.READ })
  FindByDate(@Query() paginationByDateDto: PaginationByDateDTO) {
    return this.supplyFindService.FindByDate(paginationByDateDto);
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/reason/')
  @SetRoutePolicy({ resource: Resource.SUPPLIES, action: Action.READ })
  FindByReason(@Query() paginationByReasonDto: PaginationByReasonDTO) {
    return this.supplyFindService.FindByReason(paginationByReasonDto);
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/totalWeightPerRegister/')
  @SetRoutePolicy({ resource: Resource.SUPPLIES, action: Action.READ })
  FindByTotalWeightPerRegister(
    @Query() paginationByTotalWeightDto: PaginationByTotalWeightDTO,
  ) {
    return this.supplyFindService.FindByTotalWeightPerRegister(
      paginationByTotalWeightDto,
    );
  }
}
