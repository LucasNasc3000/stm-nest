import {
  Body,
  Controller,
  Get,
  Param,
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
import { CreateOutflowDTO } from './dto/create-outflow.dto';
import { PaginationByCategoryDTO } from './dto/pagination-category.dto';
import { PaginationByDateDTO } from './dto/pagination-date.dto';
import { PaginationByEmployeeDTO } from './dto/pagination-employee.dto';
import { PaginationByHourDTO } from './dto/pagination-hour.dto';
import { PaginationByNameDTO } from './dto/pagination-name.dto';
import { PaginationByReasonDTO } from './dto/pagination-reason.dto';
import { PaginationByTypeDTO } from './dto/pagination-type.dto';
import { PaginationByUnitiesDTO } from './dto/pagination-unities.dto';
import { OutflowService } from './outflow.service';

@UseGuards(RoutePolicyGuard)
@Controller('outflows')
export class OutflowController {
  constructor(private readonly outflowsService: OutflowService) {}

  @Post('create/supply')
  @SetRoutePolicy({ resource: Resource.OUTFLOWS, action: Action.CREATE })
  CreateForSupply(
    @Body() body: CreateOutflowDTO,
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
  ) {
    return this.outflowsService.CreateForSupply(body, tokenPayloadDTO);
  }

  @Post('create/product')
  @SetRoutePolicy({ resource: Resource.OUTFLOWS, action: Action.CREATE })
  CreateForProduct(
    @Body() body: CreateOutflowDTO,
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
  ) {
    return this.outflowsService.CreateForProduct(body, tokenPayloadDTO);
  }

  @Get('search/id/:id')
  @SetRoutePolicy({ resource: Resource.OUTFLOWS, action: Action.READ })
  FindById(@Param('id') id: UrlUuidDTO) {
    return this.outflowsService.FindById(id);
  }

  @Get('search/name/')
  @SetRoutePolicy({ resource: Resource.OUTFLOWS, action: Action.READ })
  FindByName(@Query() paginationByNameDto: PaginationByNameDTO) {
    return this.outflowsService.FindByName(paginationByNameDto);
  }

  @Get('search/category/')
  @SetRoutePolicy({ resource: Resource.OUTFLOWS, action: Action.READ })
  FindByCategory(@Query() paginationByCategoryDto: PaginationByCategoryDTO) {
    return this.outflowsService.FindByCategory(paginationByCategoryDto);
  }

  @Get('search/type/')
  @SetRoutePolicy({ resource: Resource.OUTFLOWS, action: Action.READ })
  FindByType(@Query() paginationByTypeDto: PaginationByTypeDTO) {
    return this.outflowsService.FindByType(paginationByTypeDto);
  }

  @Get('search/date/')
  @SetRoutePolicy({ resource: Resource.OUTFLOWS, action: Action.READ })
  FindByDate(@Query() paginationByDateDto: PaginationByDateDTO) {
    return this.outflowsService.FindByDate(paginationByDateDto);
  }

  @Get('search/hour/')
  @SetRoutePolicy({ resource: Resource.OUTFLOWS, action: Action.READ })
  FindByHour(@Query() paginationByHourDto: PaginationByHourDTO) {
    return this.outflowsService.FindByHour(paginationByHourDto);
  }

  @Get('search/unities/')
  @SetRoutePolicy({ resource: Resource.OUTFLOWS, action: Action.READ })
  FindByUnities(@Query() paginationByUnitiesDto: PaginationByUnitiesDTO) {
    return this.outflowsService.FindByUnities(paginationByUnitiesDto);
  }

  @Get('search/reason/')
  @SetRoutePolicy({ resource: Resource.OUTFLOWS, action: Action.READ })
  FindByReason(@Query() paginationByReasonDto: PaginationByReasonDTO) {
    return this.outflowsService.FindByReason(paginationByReasonDto);
  }

  @Get('search/employee/')
  @SetRoutePolicy({ resource: Resource.OUTFLOWS, action: Action.READ })
  FindByEmployee(@Query() paginationByEmployeeDto: PaginationByEmployeeDTO) {
    return this.outflowsService.FindByEmployee(paginationByEmployeeDto);
  }
}
