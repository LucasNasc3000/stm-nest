import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
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
import { CreateProductWithRecipeDTO } from './dto/create-product-with-recipe.dto';
import { CreateProductWithoutRecipeDTO } from './dto/create-product-without-recipe.dto';
import { PaginationByCategoryDTO } from './dto/pagination-category.dto';
import { PaginationByDateDTO } from './dto/pagination-date.dto';
import { PaginationByEmployeeDTO } from './dto/pagination-employee.dto';
import { PaginationByInflowEmployeeDTO } from './dto/pagination-inflow-employee.dto';
import { PaginationByInflowExpDateDTO } from './dto/pagination-inflow-exp-date.dto';
import { PaginationByInflowProductDTO } from './dto/pagination-inflow-product.dto';
import { PaginationByIngredientDTO } from './dto/pagination-ingredient.dto';
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
    private readonly logger: Logger,
  ) {}

  @SkipThrottle({ read: true, auth: true })
  @Post('create/withoutRecipe')
  @SetRoutePolicy({ resource: Resource.PRODUCTS, action: Action.CREATE })
  CreateWithoutRecipe(
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
    @Body() body: CreateProductWithoutRecipeDTO,
  ) {
    return this.productService.CreateWithoutRecipe(tokenPayloadDTO, body);
  }

  @SkipThrottle({ read: true, auth: true })
  @Post('create/withRecipe')
  @SetRoutePolicy({ resource: Resource.PRODUCTS, action: Action.CREATE })
  CreateWithRecipe(
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
    @Body() body: CreateProductWithRecipeDTO,
  ) {
    return this.productService.CreateWithRecipe(tokenPayloadDTO, body);
  }

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

  @SkipThrottle({ read: true, auth: true })
  @Patch('update/general/:id')
  @SetRoutePolicy({ resource: Resource.PRODUCTS, action: Action.UPDATE })
  UpdateProduct(
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
    @Param() id: UrlUuidDTO,
    @Body() updateProductDTO: UpdateProductDTO,
  ) {
    return this.productService.Update(tokenPayloadDTO, id.id, updateProductDTO);
  }

  @SkipThrottle({ read: true, auth: true })
  @Patch('update/price/:id')
  @SetRoutePolicy({ resource: Resource.PRODUCTS, action: Action.EDIT_PRICES })
  UpdateProductPrice(
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
    @Param() id: UrlUuidDTO,
    @Body() updatePriceProductDTO: UpdatePriceProductDTO,
  ) {
    return this.productService.UpdatePrice(
      tokenPayloadDTO,
      id.id,
      updatePriceProductDTO,
    );
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/name/')
  @SetRoutePolicy({ resource: Resource.PRODUCTS, action: Action.READ })
  async FindByName(
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
    @Res({ passthrough: true }) res: Response,
    @Query() paginationByNameDto: PaginationByNameDTO,
  ) {
    const findProducts = await this.productFindService.FindByName(
      tokenPayloadDTO,
      paginationByNameDto,
    );

    if (paginationByNameDto.forDisplay && findProducts[1].length === 0) {
      res.status(HttpStatus.NO_CONTENT);
      return;
    }

    return findProducts;
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/category/')
  @SetRoutePolicy({ resource: Resource.PRODUCTS, action: Action.READ })
  FindByCategory(
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
    @Query() paginationByCategoryDto: PaginationByCategoryDTO,
  ) {
    return this.productFindService.FindByCategory(
      tokenPayloadDTO,
      paginationByCategoryDto,
    );
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/price/')
  @SetRoutePolicy({ resource: Resource.PRODUCTS, action: Action.READ })
  FindByPrice(
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
    @Query() paginationByPriceDto: PaginationByPriceDTO,
  ) {
    return this.productFindService.FindByPrice(
      tokenPayloadDTO,
      paginationByPriceDto,
    );
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/employee/')
  @SetRoutePolicy({ resource: Resource.PRODUCTS, action: Action.READ })
  async FindByEmployee(
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
    @Query() paginationByEmployeeDto: PaginationByEmployeeDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    const findProducts = await this.productFindService.FindByEmployee(
      tokenPayloadDTO,
      paginationByEmployeeDto,
    );

    if (
      paginationByEmployeeDto.forDisplay === true &&
      findProducts[1].length === 0
    ) {
      res.status(HttpStatus.NO_CONTENT);
      return;
    }

    return findProducts;
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/recipe/')
  @SetRoutePolicy({ resource: Resource.PRODUCTS, action: Action.READ })
  async FindByProductIngredient(
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
    @Query() paginationByIngredientDto: PaginationByIngredientDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    const findIngredients =
      await this.productFindService.FindIngredientByProduct(
        tokenPayloadDTO,
        paginationByIngredientDto,
      );

    if (
      paginationByIngredientDto.forDisplay === true &&
      findIngredients[1].length === 0
    ) {
      res.status(HttpStatus.NO_CONTENT);
      return;
    }

    return findIngredients;
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/date/')
  @SetRoutePolicy({ resource: Resource.PRODUCTS, action: Action.READ })
  FindByExpirationDate(
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
    @Query() paginationByDateDto: PaginationByDateDTO,
  ) {
    return this.productFindService.FindByDate(
      tokenPayloadDTO,
      paginationByDateDto,
    );
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/employee/inflows')
  @SetRoutePolicy({ resource: Resource.PRODUCTS, action: Action.READ })
  async FindByInflowsEmployee(
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
    @Query() paginationByInflowEmployeeDto: PaginationByInflowEmployeeDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    const findInflows = await this.productFindService.FindInflowByEmployee(
      tokenPayloadDTO,
      paginationByInflowEmployeeDto,
    );

    if (
      paginationByInflowEmployeeDto.forDisplay === true &&
      findInflows[1].length === 0
    ) {
      res.status(HttpStatus.NO_CONTENT);
      return;
    }

    return findInflows;
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/inflows/product')
  @SetRoutePolicy({ resource: Resource.PRODUCTS, action: Action.READ })
  FindByInflowsProduct(
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
    @Query() paginationByInflowProductDto: PaginationByInflowProductDTO,
  ) {
    return this.productFindService.FindInflowByProduct(
      tokenPayloadDTO,
      paginationByInflowProductDto,
    );
  }

  @SkipThrottle({ write: true, auth: true })
  @Get('search/inflows/expirationDate')
  @SetRoutePolicy({ resource: Resource.PRODUCTS, action: Action.READ })
  FindByInflowsExpirationDate(
    @TokenPayloadParam() tokenPayloadDTO: TokenPayloadDTO,
    @Query() paginationByInflowExpDateDto: PaginationByInflowExpDateDTO,
  ) {
    return this.productFindService.FindInflowByExpirationDate(
      tokenPayloadDTO,
      paginationByInflowExpDateDto,
    );
  }
}
