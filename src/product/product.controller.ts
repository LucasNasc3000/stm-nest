import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { SetRoutePolicy } from 'src/auth/decorators/set-route-policy.decorator';
import { SkipCsrf } from 'src/auth/decorators/skip-csrf.decorator';
import { TokenPayloadDTO } from 'src/auth/dto/token-payload.dto';
import { RoutePolicyGuard } from 'src/auth/guards/route-policy.guard';
import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
import { Action, Resource } from 'src/common/enums/permissions.enum';
import { CreateProductWithRecipeDTO } from './dto/create-product-with-recipe.dto';
import { CreateProductWithoutRecipeDTO } from './dto/create-product-without-recipe.dto';
import { PaginationByCategoryDTO } from './dto/pagination-category.dto';
import { PaginationByEmployeeDTO } from './dto/pagination-employee.dto';
import { PaginationByExpDateDTO } from './dto/pagination-exp-date.dto';
import { PaginationByNameDTO } from './dto/pagination-name.dto';
import { PaginationByPriceDTO } from './dto/pagination-price.dto';
import { UpdatePriceProductDTO } from './dto/update-product-price.dto';
import { UpdateProductDTO } from './dto/update-product.dto';
import { ProductFindService } from './product-find.service';
import { ProductService } from './product.service';

@UseGuards(RoutePolicyGuard)
@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly productFindService: ProductFindService,
  ) {}

  @SkipCsrf()
  @SkipThrottle({ read: true, auth: true })
  @Post('create/withoutRecipe')
  @SetRoutePolicy({ resource: Resource.PRODUCTS, action: Action.CREATE })
  CreateWithoutRecipe(
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
    @Body() body: CreateProductWithoutRecipeDTO,
  ) {
    return this.productService.CreateWithoutRecipe(tokenPayloadDTO, body);
  }

  @SkipCsrf()
  @SkipThrottle({ read: true, auth: true })
  @Post('create/withRecipe')
  @SetRoutePolicy({ resource: Resource.PRODUCTS, action: Action.CREATE })
  CreateWithRecipe(
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
    @Body() body: CreateProductWithRecipeDTO,
  ) {
    return this.productService.CreateWithRecipe(tokenPayloadDTO, body);
  }

  @SkipCsrf()
  @SkipThrottle({ read: true, auth: true })
  @Post('create/withRecipe/registeredSupplies')
  @SetRoutePolicy({ resource: Resource.PRODUCTS, action: Action.CREATE })
  CreateWithRecipeAndRegisteredSupplies(
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
    @Body() body: CreateProductWithRecipeDTO,
  ) {
    return this.productService.CreateWithRecipeAndRegisteredSupplies(
      tokenPayloadDTO,
      body,
    );
  }

  @SkipCsrf()
  @SkipThrottle({ read: true, auth: true })
  @Patch('update/general/:id')
  @SetRoutePolicy({ resource: Resource.PRODUCTS, action: Action.UPDATE })
  UpdateProduct(
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
    @Param() id: string,
    @Body() updateProductDTO: UpdateProductDTO,
  ) {
    return this.productService.Update(tokenPayloadDTO, id, updateProductDTO);
  }

  @SkipThrottle({ read: true, auth: true })
  @Patch('update/price/:id')
  @SetRoutePolicy({ resource: Resource.PRODUCTS, action: Action.EDIT_PRICES })
  UpdateProductPrice(
    @Param() id: string,
    @Body() updatePriceProductDTO: UpdatePriceProductDTO,
  ) {
    return this.productService.UpdatePrice(id, updatePriceProductDTO);
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/name/')
  @SetRoutePolicy({ resource: Resource.PRODUCTS, action: Action.READ })
  FindByName(@Query() paginationByNameDto: PaginationByNameDTO) {
    return this.productFindService.FindByName(paginationByNameDto);
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/category/')
  @SetRoutePolicy({ resource: Resource.PRODUCTS, action: Action.READ })
  FindByCategory(@Query() paginationByCategoryDto: PaginationByCategoryDTO) {
    return this.productFindService.FindByCategory(paginationByCategoryDto);
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/price/')
  @SetRoutePolicy({ resource: Resource.PRODUCTS, action: Action.READ })
  FindByPrice(@Query() paginationByPriceDto: PaginationByPriceDTO) {
    return this.productFindService.FindByPrice(paginationByPriceDto);
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/employee/')
  @SetRoutePolicy({ resource: Resource.SUPPLIES, action: Action.READ })
  FindByEmployee(@Query() paginationByEmployeeDto: PaginationByEmployeeDTO) {
    return this.productFindService.FindByEmployee(paginationByEmployeeDto);
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/expirationDate/')
  @SetRoutePolicy({ resource: Resource.PRODUCTS, action: Action.READ })
  FindByExpirationDate(
    @Query() paginationByExpDateDto: PaginationByExpDateDTO,
  ) {
    return this.productFindService.FindByExpirationDate(paginationByExpDateDto);
  }
}
