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
import { StorageService } from './storage.service';
import { CreateStorageDto } from './dto/create-storage.dto';
import { UpdateStorageDto } from './dto/update-storage.dto';
import { PaginationStorageDto } from './dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities';
import { ValidRoles } from 'src/auth/interfaces';

@Controller('storage')
@Auth() //Todo usuario debe estar authenticated
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post()
  @Auth(ValidRoles.admin)
  create(@Body() createStorageDto: CreateStorageDto, @GetUser() user: User) {
    return this.storageService.create(createStorageDto);
  }

  @Get()
  findAll(@Query() paginationStorageDto: PaginationStorageDto) {
    return this.storageService.findAll(paginationStorageDto);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.storageService.findOne(term);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateStorageDto: UpdateStorageDto,
  ) {
    return this.storageService.update(id, updateStorageDto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.storageService.remove(id);
  }

  @Get('activated/:id')
  activated(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() isActive: { active: boolean },
  ) {
    return this.storageService.activated(id, isActive);
  }
}
