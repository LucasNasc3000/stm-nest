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
import { SetRoutePolicy } from 'src/auth/decorators/set-route-policy.decorator';
import { TokenPayloadDTO } from 'src/auth/dto/token-payload.dto';
import { RoutePolicyGuard } from 'src/auth/guards/route-policy.guard';
import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
import { UrlUuidDTO } from 'src/common/dto/url-uuid.dto';
import { CreateProductWithRecipeDTO } from './dto/create-product-with-recipe.dto';
import { CreateProductWithoutRecipeDTO } from './dto/create-product-without-recipe.dto';
import { PaginationByCategoryDTO } from './dto/pagination-category.dto';
import { PaginationByExpDateDTO } from './dto/pagination-exp-date.dto';
import { PaginationByNameDTO } from './dto/pagination-name.dto';
import { PaginationByPriceDTO } from './dto/pagination-price.dto';
import { PaginationByUnitiesDTO } from './dto/pagination-unities.dto';
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

  @Post('create/withoutRecipe')
  @SetRoutePolicy(EmployeeRole.CREATE)
  @SetRoutePolicy(EmployeeRole.PRODUCTS)
  CreateWithoutRecipe(
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
    @Body() body: CreateProductWithoutRecipeDTO,
  ) {
    return this.productService.CreateWithoutRecipe(tokenPayloadDTO, body);
  }

  @Post('create/withRecipe')
  @SetRoutePolicy(EmployeeRole.CREATE)
  @SetRoutePolicy(EmployeeRole.PRODUCTS)
  CreateWithRecipe(
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
    @Body() body: CreateProductWithRecipeDTO,
  ) {
    return this.productService.CreateWithRecipe(tokenPayloadDTO, body);
  }

  @Post('create/withRecipe/registeredSupplies')
  @SetRoutePolicy(EmployeeRole.CREATE)
  @SetRoutePolicy(EmployeeRole.PRODUCTS)
  CreateWithRecipeAndRegisteredSupplies(
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
    @Body() body: CreateProductWithRecipeDTO,
  ) {
    return this.productService.CreateWithRecipeAndRegisteredSupplies(
      tokenPayloadDTO,
      body,
    );
  }

  @Post('create/recipe')
  @SetRoutePolicy(EmployeeRole.CREATE)
  @SetRoutePolicy(EmployeeRole.PRODUCTS)
  CreateRecipe(
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
    @Body() body: any,
  ) {
    const { productId, createRecipe, useStockSupplies } = body;

    return this.productService.CreateRecipe(
      tokenPayloadDTO,
      productId,
      createRecipe,
      useStockSupplies,
    );
  }

  @Patch()
  @SetRoutePolicy(EmployeeRole.UPDATE)
  @SetRoutePolicy(EmployeeRole.PRODUCTS)
  UpdateProduct(
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
    @Param('id') id: UrlUuidDTO,
    @Body() updateProductDTO: UpdateProductDTO,
  ) {
    return this.productService.Update(tokenPayloadDTO, id, updateProductDTO);
  }

  @Get('search/name/')
  @SetRoutePolicy(EmployeeRole.READ)
  @SetRoutePolicy(EmployeeRole.PRODUCTS)
  FindByName(@Query() paginationByNameDto: PaginationByNameDTO) {
    return this.productFindService.FindByName(paginationByNameDto);
  }

  @Get('search/category/')
  @SetRoutePolicy(EmployeeRole.READ)
  @SetRoutePolicy(EmployeeRole.PRODUCTS)
  FindByCategory(@Query() paginationByCategoryDto: PaginationByCategoryDTO) {
    return this.productFindService.FindByCategory(paginationByCategoryDto);
  }

  @Get('search/price/')
  @SetRoutePolicy(EmployeeRole.READ)
  @SetRoutePolicy(EmployeeRole.PRODUCTS)
  FindByPrice(@Query() paginationByPriceDto: PaginationByPriceDTO) {
    return this.productFindService.FindByPrice(paginationByPriceDto);
  }

  @Get('search/unities/')
  @SetRoutePolicy(EmployeeRole.READ)
  @SetRoutePolicy(EmployeeRole.PRODUCTS)
  FindByUnities(@Query() paginationByUnitiesDto: PaginationByUnitiesDTO) {
    return this.productFindService.FindByUnities(paginationByUnitiesDto);
  }

  @Get('search/expirationDate/')
  @SetRoutePolicy(EmployeeRole.READ)
  @SetRoutePolicy(EmployeeRole.PRODUCTS)
  FindByExpirationDate(
    @Query() paginationByExpDateDto: PaginationByExpDateDTO,
  ) {
    return this.productFindService.FindByExpirationDate(paginationByExpDateDto);
  }
}
