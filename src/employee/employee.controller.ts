import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { SetRoutePolicy } from 'src/auth/decorators/set-route-policy.decorator';
import { TokenPayloadDTO } from 'src/auth/dto/token-payload.dto';
import { RoutePolicyGuard } from 'src/auth/guards/route-policy.guard';
import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
import { UrlUuidDTO } from 'src/common/dto/url-uuid.dto';
import { Action, Resource } from 'src/common/enums/permissions.enum';
import { ReqBodyCpfValidation } from 'src/common/pipes/cpf-validation-body-request.pipe';
import { CreateEmployeeDTO } from './dto/create-employee.dto';
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

  @Post()
  @SetRoutePolicy({ resource: Resource.EMPLOYEES, action: Action.CREATE })
  @UsePipes(ReqBodyCpfValidation)
  Create(@Body() body: CreateEmployeeDTO) {
    return this.employeesService.Create(body);
  }

  @Patch('update/self/:id')
  @UsePipes(ReqBodyCpfValidation)
  UpdateSelf(
    @Param('id') id: UrlUuidDTO,
    @Body() updateEmployeeDTO: UpdateEmployeeDTO,
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
  ) {
    return this.employeesService.UpdateSelf(
      id,
      updateEmployeeDTO,
      tokenPayloadDTO,
    );
  }

  @Patch('update/admin/:id')
  @SetRoutePolicy({ resource: Resource.EMPLOYEES, action: Action.UPDATE })
  @UsePipes(ReqBodyCpfValidation)
  UpdateAdmin(
    @Param('id') id: UrlUuidDTO,
    @Body() updateEmployeeAdminDTO: UpdateEmployeeAdminDTO,
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
  ) {
    return this.employeesService.UpdateAdmin(
      id,
      updateEmployeeAdminDTO,
      tokenPayloadDTO,
    );
  }

  @Get('search/email/:email')
  @SetRoutePolicy({ resource: Resource.EMPLOYEES, action: Action.READ })
  FindByEmail(@Param('email') email: SearchByEmailDTO) {
    return this.employeesService.FindByEmail(email);
  }

  @Get('search/name/')
  @SetRoutePolicy({ resource: Resource.EMPLOYEES, action: Action.READ })
  FindByName(@Query() paginationByNameDto: PaginationByNameDTO) {
    return this.employeesService.FindByName(paginationByNameDto);
  }

  @Get('search/role/')
  @SetRoutePolicy({ resource: Resource.EMPLOYEES, action: Action.READ })
  FindByRole(@Query() paginationByRoleDto: PaginationByRoleDTO) {
    return this.employeesService.FindByRole(paginationByRoleDto);
  }

  @Get()
  @SetRoutePolicy({ resource: Resource.EMPLOYEES, action: Action.READ })
  async ListExEmployees(
    @Query() paginationExEmployeesDTO: PaginationExEmployeesDTO,
  ) {
    const exEmployees = await this.employeesService.FindExEmployees(
      paginationExEmployeesDTO,
    );

    if (exEmployees.length < 1) {
      return {
        status: HttpStatus.NO_CONTENT,
        message: 'Não há ex-funcionários',
      };
    }

    return exEmployees;
  }
}
