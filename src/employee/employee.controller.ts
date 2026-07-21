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
  @Post()
  @SetRoutePolicy({ resource: Resource.EMPLOYEES, action: Action.CREATE })
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
  FindByEmail(@Query() email: SearchByEmailDTO) {
    return this.employeesService.FindByEmail(email);
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/name/')
  @SetRoutePolicy({ resource: Resource.EMPLOYEES, action: Action.READ })
  FindByName(@Query() paginationByNameDto: PaginationByNameDTO) {
    return this.employeesService.FindByName(paginationByNameDto);
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/role/')
  @SetRoutePolicy({ resource: Resource.EMPLOYEES, action: Action.READ })
  FindByRole(@Query() paginationByRoleDto: PaginationByRoleDTO) {
    return this.employeesService.FindByRole(paginationByRoleDto);
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/boss/')
  @SetRoutePolicy({ resource: Resource.EMPLOYEES, action: Action.READ })
  async FindByBoss(
    @Res() res: Response,
    @Query() paginationByBossDto: PaginationByBossDTO,
  ) {
    const findByBoss =
      await this.employeesService.FindByBoss(paginationByBossDto);

    if (findByBoss.length === 0) {
      return res.status(204).send('Nenhum funcionário cadastrado ainda');
    }

    return res.status(HttpStatus.OK).json(findByBoss);
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('exemployees')
  @SetRoutePolicy({ resource: Resource.EMPLOYEES, action: Action.READ })
  async ListExEmployees(
    @Res() res: Response,
    @Query() paginationExEmployeesDTO: PaginationExEmployeesDTO,
  ) {
    const exEmployees = await this.employeesService.FindExEmployees(
      paginationExEmployeesDTO,
    );

    if (exEmployees.length < 1) {
      return res.status(HttpStatus.NO_CONTENT).send('Não há ex-funcionários');
    }

    return res.status(HttpStatus.OK).json(exEmployees);
  }
}
