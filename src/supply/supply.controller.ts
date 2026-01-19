import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { SetRoutePolicy } from 'src/auth/decorators/set-route-policy.decorator';
import { TokenPayloadDTO } from 'src/auth/dto/token-payload.dto';
import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
import { UrlUuidDTO } from 'src/common/dto/url-uuid.dto';
import { EmployeeRole } from 'src/common/enums/employee-role.enum';
import { CreateSupplyDTO } from './dto/create-supply.dto';
import { PaginationByCategoryDTO } from './dto/pagination-category.dto';
import { PaginationByNameDTO } from './dto/pagination-name.dto';
import { PaginationByPriceDTO } from './dto/pagination-price.dto';
import { PaginationBySupplierDTO } from './dto/pagination-supplier.dto';
import { SearchByWeightPerUnitDTO } from './dto/pagination-weightperunit.dto';
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

  @Get('search/id/:id')
  @SetRoutePolicy(EmployeeRole.READ)
  @SetRoutePolicy(EmployeeRole.SUPPLIES)
  FindById(@Param('id') id: UrlUuidDTO) {
    return this.supplyService.FindById(id);
  }

  @Get('search/supplier/')
  @SetRoutePolicy(EmployeeRole.READ)
  @SetRoutePolicy(EmployeeRole.SUPPLIES)
  FindBySupplier(@Query() paginationBySupplierDto: PaginationBySupplierDTO) {
    return this.supplyService.FindBySupplier(paginationBySupplierDto);
  }

  @Get('search/name/')
  @SetRoutePolicy(EmployeeRole.READ)
  @SetRoutePolicy(EmployeeRole.SUPPLIES)
  FindByName(@Query() paginationByNameDto: PaginationByNameDTO) {
    return this.supplyService.FindByName(paginationByNameDto);
  }

  @Get('search/category/')
  @SetRoutePolicy(EmployeeRole.READ)
  @SetRoutePolicy(EmployeeRole.SUPPLIES)
  FindByCategory(@Query() paginationByCategoryDto: PaginationByCategoryDTO) {
    return this.supplyService.FindByCategory(paginationByCategoryDto);
  }

  @Get('search/price/')
  @SetRoutePolicy(EmployeeRole.READ)
  @SetRoutePolicy(EmployeeRole.SUPPLIES)
  FindByPrice(@Query() paginationByPriceDto: PaginationByPriceDTO) {
    return this.supplyService.FindByPrice(paginationByPriceDto);
  }

  @Get('search/weightPerUnit/:weightPerUnit')
  @SetRoutePolicy(EmployeeRole.READ)
  @SetRoutePolicy(EmployeeRole.SUPPLIES)
  FindByWeightPerUnit(
    @Param('weightPerUnit')
    searchByWeightPerUnitDto: SearchByWeightPerUnitDTO,
  ) {
    return this.supplyService.FindByWeightPerUnit(searchByWeightPerUnitDto);
  }
}
