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
import { CreateSaleDTO } from './dto/create-sale.dto';
import { PaginationByAddressDTO } from './dto/pagination-address.dto';
import { PaginationByClientNameDTO } from './dto/pagination-client-name.dto';
import { PaginationByDateDTO } from './dto/pagination-date.dto';
import { PaginationByEmployeeDTO } from './dto/pagination-employee.dto';
import { PaginationByHourDTO } from './dto/pagination-hour.dto';
import { UpdatePriceSaleDTO } from './dto/update-price-sale.dto';
import { UpdateSaleDTO } from './dto/update-sale.dto';
import { SaleService } from './sale.service';

@Controller('sales')
export class SaleController {
  constructor(private readonly salesService: SaleService) {}

  @Post()
  @SetRoutePolicy(EmployeeRole.CREATE)
  @SetRoutePolicy(EmployeeRole.SALES)
  CreateWithoutRecipe(
    @Body() body: CreateSaleDTO,
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
  ) {
    return this.salesService.CreateWithoutRecipe(tokenPayloadDTO, body);
  }

  @Post()
  @SetRoutePolicy(EmployeeRole.CREATE)
  @SetRoutePolicy(EmployeeRole.SALES)
  CreateWithRecipe(
    @Body() body: CreateSaleDTO,
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
  ) {
    return this.salesService.CreateWithRecipe(tokenPayloadDTO, body);
  }

  @Patch()
  @SetRoutePolicy(EmployeeRole.UPDATE)
  @SetRoutePolicy(EmployeeRole.EDIT_PRICES)
  @SetRoutePolicy(EmployeeRole.SALES)
  UpdatePrice(
    @Param('id') id: UrlUuidDTO,
    @Body() updatePriceSaleDTO: UpdatePriceSaleDTO,
  ) {
    return this.salesService.UpdatePrice(id, updatePriceSaleDTO);
  }

  @Patch()
  @SetRoutePolicy(EmployeeRole.UPDATE)
  @SetRoutePolicy(EmployeeRole.SALES)
  Update(@Param('id') id: UrlUuidDTO, @Body() updateSaleDTO: UpdateSaleDTO) {
    return this.salesService.Update(id, updateSaleDTO);
  }

  @Get('search/date/')
  @SetRoutePolicy(EmployeeRole.READ)
  @SetRoutePolicy(EmployeeRole.SALES)
  FindByDate(@Query() paginationByDateDto: PaginationByDateDTO) {
    return this.salesService.FindByDate(paginationByDateDto);
  }

  @Get('search/hour/')
  @SetRoutePolicy(EmployeeRole.READ)
  @SetRoutePolicy(EmployeeRole.SALES)
  FindByHour(@Query() paginationByHourDto: PaginationByHourDTO) {
    return this.salesService.FindByHour(paginationByHourDto);
  }

  @Get('search/name/')
  @SetRoutePolicy(EmployeeRole.READ)
  @SetRoutePolicy(EmployeeRole.SALES)
  FindByClientName(
    @Query() paginationByClientNameDto: PaginationByClientNameDTO,
  ) {
    return this.salesService.FindByClientName(paginationByClientNameDto);
  }

  @Get('search/address/')
  @SetRoutePolicy(EmployeeRole.READ)
  @SetRoutePolicy(EmployeeRole.SALES)
  FindByAddress(@Query() paginationByAddressDto: PaginationByAddressDTO) {
    return this.salesService.FindByAddress(paginationByAddressDto);
  }

  @Get('search/employee/')
  @SetRoutePolicy(EmployeeRole.READ)
  @SetRoutePolicy(EmployeeRole.SALES)
  FindByEmployee(@Query() paginationByEmployeeDto: PaginationByEmployeeDTO) {
    return this.salesService.FindByEmployee(paginationByEmployeeDto);
  }
}
