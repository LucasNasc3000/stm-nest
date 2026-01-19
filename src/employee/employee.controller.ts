import { Controller, Get, HttpStatus, Param, Query } from '@nestjs/common';
import { SetRoutePolicy } from 'src/auth/decorators/set-route-policy.decorator';
import { EmployeeRole } from 'src/common/enums/employee-role.enum';
import { PaginationByRoleDTO } from './dto/pagination-employee-role.dto';
import { PaginationExEmployeesDTO } from './dto/pagination-exemployees.dto';
import { PaginationByNameDTO } from './dto/pagination-name.dto';
import { SearchByEmailDTO } from './dto/search-email-employee.dto';
import { EmployeeService } from './employee.service';

@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeesService: EmployeeService) {}

  // @Post()
  // @SetRoutePolicy(EmployeeRole.ADMIN)
  // @UsePipes(ReqBodyCpfValidation)
  // Create(@Body() body: CreateEmployeeDTO) {
  //   return this.employeesService.Create(body);
  // }

  // @Patch('update/self/:id')
  // @UsePipes(ReqBodyCpfValidation)
  // UpdateSelf(
  //   @Param('id') id: UrlUuidDTO,
  //   @Body() updateEmployeeDTO: UpdateEmployeeDTO,
  //   @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
  // ) {
  //   return this.employeesService.UpdateSelf(
  //     id,
  //     updateEmployeeDTO,
  //     tokenPayloadDTO,
  //   );
  // }

  // @Patch('update/admin/:id')
  // @SetRoutePolicy(EmployeeRole.ADMIN)
  // @UsePipes(ReqBodyCpfValidation)
  // UpdateAdmin(
  //   @Param('id') id: UrlUuidDTO,
  //   @Body() updateEmployeeAdminDTO: UpdateEmployeeAdminDTO,
  //   @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
  // ) {
  //   return this.employeesService.UpdateAdmin(
  //     id,
  //     updateEmployeeAdminDTO,
  //     tokenPayloadDTO,
  //   );
  // }

  @Get('search/email/:email')
  @SetRoutePolicy(EmployeeRole.ADMIN)
  FindByEmail(@Param('email') email: SearchByEmailDTO) {
    return this.employeesService.FindByEmail(email);
  }

  @Get('search/name/')
  @SetRoutePolicy(EmployeeRole.ADMIN)
  FindByName(@Query() paginationByNameDto: PaginationByNameDTO) {
    return this.employeesService.FindByName(paginationByNameDto);
  }

  @Get('search/role/')
  @SetRoutePolicy(EmployeeRole.ADMIN)
  FindByRole(@Query() paginationByRoleDto: PaginationByRoleDTO) {
    return this.employeesService.FindByRole(paginationByRoleDto);
  }

  @Get()
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
