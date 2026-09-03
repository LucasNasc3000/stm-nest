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
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
    @Param() id: UrlUuidDTO,
    @Body() updateSupplyRealtimeDTO: UpdateSupplyRealtimeDTO,
  ) {
    return this.supplyService.Update(
      tokenPayloadDTO,
      id.id,
      updateSupplyRealtimeDTO,
    );
  }

  @SkipThrottle({ read: true, auth: true })
  @Patch('update/price/:id')
  @SetRoutePolicy({ resource: Resource.SUPPLIES, action: Action.EDIT_PRICES })
  UpdatePrice(
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
    @Param() id: UrlUuidDTO,
    @Body() updateSupplyRealtimePriceDTO: UpdatePriceSupplyRealtimeDTO,
  ) {
    return this.supplyService.UpdatePrice(
      tokenPayloadDTO,
      id.id,
      updateSupplyRealtimePriceDTO,
    );
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/supplier/')
  @SetRoutePolicy({ resource: Resource.SUPPLIES, action: Action.READ })
  FindBySupplier(
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
    @Query() paginationBySupplierDto: PaginationBySupplierDTO,
  ) {
    return this.supplyFindService.FindBySupplier(
      tokenPayloadDTO,
      paginationBySupplierDto,
    );
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/name/')
  @SetRoutePolicy({ resource: Resource.SUPPLIES, action: Action.READ })
  async FindByName(
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
    @Res({ passthrough: true }) res: Response,
    @Query() paginationByNameDto: PaginationByNameDTO,
  ) {
    const findSupplies = await this.supplyFindService.FindByName(
      tokenPayloadDTO,
      paginationByNameDto,
    );

    if (
      findSupplies[1].length === 0 &&
      paginationByNameDto.forDisplay === true
    ) {
      res.status(HttpStatus.NO_CONTENT);
      return;
    }

    return findSupplies;
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/category/')
  @SetRoutePolicy({ resource: Resource.SUPPLIES, action: Action.READ })
  FindByCategory(
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
    @Query() paginationByCategoryDto: PaginationByCategoryDTO,
  ) {
    return this.supplyFindService.FindByCategory(
      tokenPayloadDTO,
      paginationByCategoryDto,
    );
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/price/')
  @SetRoutePolicy({ resource: Resource.SUPPLIES, action: Action.READ })
  FindByPrice(
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
    @Query() paginationByPriceDto: PaginationByPriceDTO,
  ) {
    return this.supplyFindService.FindByPrice(
      tokenPayloadDTO,
      paginationByPriceDto,
    );
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/totalPrice/')
  @SetRoutePolicy({ resource: Resource.SUPPLIES, action: Action.READ })
  FindByTotalPrice(
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
    @Query() paginationByPriceDto: PaginationByPriceDTO,
  ) {
    return this.supplyFindService.FindByTotalPrice(
      tokenPayloadDTO,
      paginationByPriceDto,
    );
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/weightPerUnit/')
  @SetRoutePolicy({ resource: Resource.SUPPLIES, action: Action.READ })
  FindByWeightPerUnit(
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
    @Query() paginationByWeightPerUnitDto: PaginationByWeightPerUnitDTO,
  ) {
    return this.supplyFindService.FindByWeightPerUnit(
      tokenPayloadDTO,
      paginationByWeightPerUnitDto,
    );
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/employee/')
  @SetRoutePolicy({ resource: Resource.SUPPLIES, action: Action.READ })
  async FindByEmployee(
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
    @Query() paginationByEmployeeDto: PaginationByEmployeeDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    const findSupplies = await this.supplyFindService.FindByEmployee(
      tokenPayloadDTO,
      paginationByEmployeeDto,
    );

    if (findSupplies[1].length === 0) {
      if (paginationByEmployeeDto.forDisplay === true) {
        res.status(HttpStatus.NO_CONTENT);
        return;
      } else {
        res.status(HttpStatus.NOT_FOUND);
        return findSupplies;
      }
    }

    return findSupplies;
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/expirationDate/')
  @SetRoutePolicy({ resource: Resource.SUPPLIES, action: Action.READ })
  FindByExpirationDate(
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
    @Query() paginationByExpDateDto: PaginationByExpDateDTO,
  ) {
    return this.supplyFindService.FindByExpirationDate(
      tokenPayloadDTO,
      paginationByExpDateDto,
    );
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/date/')
  @SetRoutePolicy({ resource: Resource.SUPPLIES, action: Action.READ })
  FindByDate(
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
    @Query() paginationByDateDto: PaginationByDateDTO,
  ) {
    return this.supplyFindService.FindByDate(
      tokenPayloadDTO,
      paginationByDateDto,
    );
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
