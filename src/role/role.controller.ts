import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { SetRoutePolicy } from 'src/auth/decorators/set-route-policy.decorator';
import { RoutePolicyGuard } from 'src/auth/guards/route-policy.guard';
import { Action, Resource } from 'src/common/enums/permissions.enum';
import { CreateRoleDTO } from './dto/create-role.dto';
import { UpdateRoleDTO } from './dto/update-role.dto';
import { RoleService } from './role.service';

@UseGuards(RoutePolicyGuard)
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @SkipThrottle({ read: true, auth: true })
  @SetRoutePolicy({ action: Action.CREATE, resource: Resource.EMPLOYEES })
  @Post()
  CreateRole(@Body() body: CreateRoleDTO) {
    return this.roleService.CreateRole(body);
  }

  // Colocar permissão depois de testar
  // @SkipCsrf()
  // @Public()
  @SkipThrottle({ read: true, auth: true })
  @Patch(':id')
  UpdateRole(@Param('id') id: string, @Body() body: UpdateRoleDTO) {
    return this.roleService.UpdateRole(id, body);
  }
}
