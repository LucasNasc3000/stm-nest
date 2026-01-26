import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { SetRoutePolicy } from 'src/auth/decorators/set-route-policy.decorator';
import { TokenPayloadDTO } from 'src/auth/dto/token-payload.dto';
import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
import { UrlUuidDTO } from 'src/common/dto/url-uuid.dto';
import { EmployeeRole } from 'src/common/enums/employee-role.enum';
import { CreateOutflowDTO } from './dto/create-outflow.dto';
import { PaginationByCategoryDTO } from './dto/pagination-category.dto';
import { PaginationByDateDTO } from './dto/pagination-date.dto';
import { PaginationByEmployeeDTO } from './dto/pagination-employee.dto';
import { PaginationByHourDTO } from './dto/pagination-hour.dto';
import { PaginationByNameDTO } from './dto/pagination-name.dto';
import { PaginationByReasonDTO } from './dto/pagination-reason.dto';
import { PaginationByUnitiesDTO } from './dto/pagination-unities.dto';
import { OutflowService } from './outflow.service';

@Controller('outflows')
export class OutflowController {
  constructor(private readonly outflowsService: OutflowService) {}

  @Post()
  @SetRoutePolicy(EmployeeRole.CREATE)
  @SetRoutePolicy(EmployeeRole.OUTFLOWS)
  Create(
    @Body() body: CreateOutflowDTO,
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
  ) {
    return this.outflowsService.Create(body, tokenPayloadDTO);
  }

  @Get('search/id/:id')
  @SetRoutePolicy(EmployeeRole.READ)
  @SetRoutePolicy(EmployeeRole.OUTFLOWS)
  FindById(@Param('id') id: UrlUuidDTO) {
    return this.outflowsService.FindById(id);
  }

  @Get('search/name/')
  @SetRoutePolicy(EmployeeRole.READ)
  @SetRoutePolicy(EmployeeRole.OUTFLOWS)
  FindByName(@Query() paginationByNameDto: PaginationByNameDTO) {
    return this.outflowsService.FindByName(paginationByNameDto);
  }

  @Get('search/category/')
  @SetRoutePolicy(EmployeeRole.READ)
  @SetRoutePolicy(EmployeeRole.OUTFLOWS)
  FindByCategory(@Query() paginationByCategoryDto: PaginationByCategoryDTO) {
    return this.outflowsService.FindByCategory(paginationByCategoryDto);
  }

  @Get('search/date/')
  @SetRoutePolicy(EmployeeRole.READ)
  @SetRoutePolicy(EmployeeRole.OUTFLOWS)
  FindByDate(@Query() paginationByDateDto: PaginationByDateDTO) {
    return this.outflowsService.FindByDate(paginationByDateDto);
  }

  @Get('search/hour/')
  @SetRoutePolicy(EmployeeRole.READ)
  @SetRoutePolicy(EmployeeRole.OUTFLOWS)
  FindByHour(@Query() paginationByHourDto: PaginationByHourDTO) {
    return this.outflowsService.FindByHour(paginationByHourDto);
  }

  @Get('search/unities/')
  @SetRoutePolicy(EmployeeRole.READ)
  @SetRoutePolicy(EmployeeRole.OUTFLOWS)
  FindByUnities(@Query() paginationByUnitiesDto: PaginationByUnitiesDTO) {
    return this.outflowsService.FindByUnities(paginationByUnitiesDto);
  }

  @Get('search/reason/')
  @SetRoutePolicy(EmployeeRole.READ)
  @SetRoutePolicy(EmployeeRole.OUTFLOWS)
  FindByReason(@Query() paginationByReasonDto: PaginationByReasonDTO) {
    return this.outflowsService.FindByReason(paginationByReasonDto);
  }

  @Get('search/employee/')
  @SetRoutePolicy(EmployeeRole.READ)
  @SetRoutePolicy(EmployeeRole.OUTFLOWS)
  FindByEmployee(@Query() paginationByEmployeeDto: PaginationByEmployeeDTO) {
    return this.outflowsService.FindByEmployee(paginationByEmployeeDto);
  }
}
