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
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities';
import { ValidRoles } from 'src/auth/interfaces';
import { CategoriesService } from './categories.service';
import { PaginationCategoryDto } from './dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
@Auth()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto, @GetUser() user: User) {
    return this.categoriesService.create(createCategoryDto, user);
  }

  @Get()
  findAll(@Query() paginationCategoryDto: PaginationCategoryDto) {
    return this.categoriesService.findAll(paginationCategoryDto);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.categoriesService.findOne(term);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @GetUser() user: User,
  ) {
    return this.categoriesService.update(id, updateCategoryDto, user);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin, ValidRoles.superUser)
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.categoriesService.remove(id);
  }

  @Get('activated/:id')
  @Auth(ValidRoles.admin, ValidRoles.delivery)
  activated(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @GetUser() user: User) {
    return this.categoriesService.activated(id, user);
  }
}
