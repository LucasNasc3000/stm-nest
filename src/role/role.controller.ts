import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { SkipCsrf } from 'src/auth/decorators/skip-csrf.decorator';
import { RoutePolicyGuard } from 'src/auth/guards/route-policy.guard';
import { CreateRoleDTO } from './dto/create-role.dto';
import { RoleService } from './role.service';

@UseGuards(RoutePolicyGuard)
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @SkipCsrf()
  @SkipThrottle({ read: true, auth: true })
  @Post()
  CreateRole(@Body() body: CreateRoleDTO) {
    return this.roleService.CreateRole(body);
  }
}
