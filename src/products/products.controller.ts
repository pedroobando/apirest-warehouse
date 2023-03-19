import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, PaginationProductDto, StockProductDto, UpdateProductDto } from './dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities';
import { ValidRoles } from 'src/auth/interfaces';

@Controller('products')
@Auth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto, @GetUser() user: User) {
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  findAll(@Query() paginationProductDto: PaginationProductDto) {
    return this.productsService.findAll(paginationProductDto);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.productsService.findOne(term);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: User,
  ) {
    return this.productsService.update(id, updateProductDto, user);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin, ValidRoles.superUser)
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.productsService.remove(id);
  }

  @Get('activated/:id')
  @Auth(ValidRoles.admin, ValidRoles.superUser)
  activated(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @GetUser() user: User) {
    return this.productsService.activated(id, user);
  }

  @Patch('stock/:id')
  updateStock(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() stockProductDto: StockProductDto,
  ) {
    return this.productsService.updateStock(id, stockProductDto);
  }

  @Delete('stock/:id')
  removeStock(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() stockProductDto: StockProductDto,
  ) {
    return this.productsService.removeStock(id, stockProductDto);
  }
}
