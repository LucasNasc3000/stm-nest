import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Response } from 'express';
import { SetRoutePolicy } from 'src/auth/decorators/set-route-policy.decorator';
import { TokenPayloadDTO } from 'src/auth/dto/token-payload.dto';
import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
import { UrlUuidDTO } from 'src/common/dto/url-uuid.dto';
import { Action, Resource } from 'src/common/enums/permissions.enum';
import { CreatePlatformDTO } from './dto/create-platform.dto';
import { PaginationByEmployeeDTO } from './dto/pagination-employee.dto';
import { UpdatePlatformDTO } from './dto/update-platform.dto';
import { PlatformService } from './platform.service';

@Controller('platforms')
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  @SkipThrottle({ auth: true, read: true })
  @Post()
  @SetRoutePolicy({ action: Action.CREATE, resource: Resource.PLATFORMS })
  Create(
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
    @Body() body: CreatePlatformDTO,
  ) {
    return this.platformService.Create(tokenPayloadDTO, body);
  }

  @SkipThrottle({ read: true, auth: true })
  @Patch(':id')
  @SetRoutePolicy({ resource: Resource.PLATFORMS, action: Action.UPDATE })
  Update(@Param() id: UrlUuidDTO, @Body() body: UpdatePlatformDTO) {
    return this.platformService.Update(id.id, body);
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/employee')
  @SetRoutePolicy({ resource: Resource.PLATFORMS, action: Action.READ })
  async FindByEmployee(
    @Res() res: Response,
    @Query() paginationByEmployeeDTO: PaginationByEmployeeDTO,
  ) {
    const findPlatforms = await this.platformService.FindByEmployee(
      paginationByEmployeeDTO,
    );

    if (
      paginationByEmployeeDTO.forDisplay === true &&
      findPlatforms[1].length === 0
    ) {
      return res
        .status(HttpStatus.NO_CONTENT)
        .send('Nenhuma plataforma registrada ainda');
    }

    return res.status(HttpStatus.OK).json(findPlatforms);
  }

  @SkipThrottle({ read: true, auth: true })
  @Delete(':id')
  @SetRoutePolicy({ resource: Resource.PLATFORMS, action: Action.DELETE })
  async Delete(@Res() res: Response, @Param() id: UrlUuidDTO) {
    const deletePlatform = await this.platformService.Delete(id.id);
    return res.status(HttpStatus.NO_CONTENT).send(deletePlatform);
  }
}
