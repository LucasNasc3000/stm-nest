import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Response } from 'express';
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
import { UpdateSaleDTO } from './dto/update-sale.dto';
import { SaleService } from './sale.service';

@UseGuards(RoutePolicyGuard)
@Controller('sales')
export class SaleController {
  constructor(private readonly salesService: SaleService) {}

  @SkipThrottle({ read: true, auth: true })
  @Post()
  @SetRoutePolicy({ resource: Resource.SALES, action: Action.CREATE })
  Create(
    @Body() body: CreateSaleDTO,
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
  ) {
    return this.salesService.Create(tokenPayloadDTO, body);
  }

  @SkipThrottle({ read: true, auth: true })
  @Patch(':id')
  @SetRoutePolicy({ resource: Resource.SALES, action: Action.UPDATE })
  Update(
    @Param() id: UrlUuidDTO,
    @Body() updateSaleDTO: UpdateSaleDTO,
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
  ) {
    return this.salesService.Update(id.id, updateSaleDTO, tokenPayloadDTO);
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
  @Get('search/clientName/')
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
  async FindByEmployee(
    @Query() paginationByEmployeeDto: PaginationByEmployeeDTO,
    @Res() res: Response,
  ) {
    const findSales = await this.salesService.FindByEmployee(
      paginationByEmployeeDto,
    );

    if (
      paginationByEmployeeDto.forDisplay === true &&
      findSales[1].length === 0
    ) {
      return res.status(HttpStatus.NO_CONTENT).send();
    }

    return res.status(HttpStatus.OK).json(findSales);
  }
}
