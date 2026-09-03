import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
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
import { CreateEmployeeDTO } from './dto/create-employee.dto';
import { PaginationByBossDTO } from './dto/pagination-employee-boss.dto';
import { PaginationByRoleDTO } from './dto/pagination-employee-role.dto';
import { PaginationExEmployeesDTO } from './dto/pagination-exemployees.dto';
import { PaginationByNameDTO } from './dto/pagination-name.dto';
import { SearchByEmailDTO } from './dto/search-email-employee.dto';
import { UpdateEmployeeAdminDTO } from './dto/update-employee-admin.dto';
import { UpdateEmployeeDTO } from './dto/update-employee.dto';
import { EmployeeService } from './employee.service';

@UseGuards(RoutePolicyGuard)
@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeesService: EmployeeService) {}

  @SkipThrottle({ read: true, auth: true })
  // @Post()
  // @SetRoutePolicy({ resource: Resource.EMPLOYEES, action: Action.CREATE })
  Create(@Body() body: CreateEmployeeDTO) {
    return this.employeesService.Create(body);
  }

  @SkipThrottle({ read: true, auth: true })
  @Patch('update/self')
  UpdateSelf(
    @Body() updateEmployeeDTO: UpdateEmployeeDTO,
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
  ) {
    return this.employeesService.UpdateSelf(updateEmployeeDTO, tokenPayloadDTO);
  }

  @SkipThrottle({ read: true, auth: true })
  @Patch('update/admin/:id')
  @SetRoutePolicy({ resource: Resource.EMPLOYEES, action: Action.UPDATE })
  UpdateAdmin(
    @Param() id: UrlUuidDTO,
    @Body() updateEmployeeAdminDTO: UpdateEmployeeAdminDTO,
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
  ) {
    return this.employeesService.UpdateAdmin(
      id,
      updateEmployeeAdminDTO,
      tokenPayloadDTO,
    );
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/self')
  FindSelf(@TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO) {
    return this.employeesService.FindSelf(tokenPayloadDTO);
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/email/')
  @SetRoutePolicy({ resource: Resource.EMPLOYEES, action: Action.READ })
  FindByEmail(
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
    @Query() email: SearchByEmailDTO,
  ) {
    return this.employeesService.FindByEmail(tokenPayloadDTO, email);
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/name/')
  @SetRoutePolicy({ resource: Resource.EMPLOYEES, action: Action.READ })
  FindByName(
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
    @Query() paginationByNameDto: PaginationByNameDTO,
  ) {
    return this.employeesService.FindByName(
      tokenPayloadDTO,
      paginationByNameDto,
    );
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/role/')
  @SetRoutePolicy({ resource: Resource.EMPLOYEES, action: Action.READ })
  FindByRole(
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
    @Query() paginationByRoleDto: PaginationByRoleDTO,
  ) {
    return this.employeesService.FindByRole(
      tokenPayloadDTO,
      paginationByRoleDto,
    );
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/boss/')
  @SetRoutePolicy({ resource: Resource.EMPLOYEES, action: Action.READ })
  async FindByBoss(
    @Res({ passthrough: true }) res: Response,
    @Query() paginationByBossDto: PaginationByBossDTO,
  ) {
    const findByBoss =
      await this.employeesService.FindByBoss(paginationByBossDto);

    if (findByBoss.length === 0) {
      res.status(HttpStatus.NO_CONTENT);
      return;
    }

    return findByBoss;
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/exemployees')
  @SetRoutePolicy({ resource: Resource.EMPLOYEES, action: Action.READ })
  async ListExEmployees(
    @Res({ passthrough: true }) res: Response,
    @Query() paginationExEmployeesDTO: PaginationExEmployeesDTO,
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
  ) {
    const exEmployees = await this.employeesService.FindExEmployees(
      tokenPayloadDTO,
      paginationExEmployeesDTO,
    );

    if (exEmployees.length === 0) {
      res.status(HttpStatus.NO_CONTENT);
      return;
    }

    return exEmployees;
  }
}
