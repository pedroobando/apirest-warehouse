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
import { EndSitesService } from './endsites.service';
import { CreateEndSiteDto } from './dto/create-endsite.dto';
import { UpdateEndSiteDto } from './dto/update-endsite.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities';
import { PaginationEndSiteDto } from './dto';
import { ValidRoles } from 'src/auth/interfaces';

@Controller('endsites')
@Auth() //Todo usuario debe estar authenticated
export class EndSitesController {
  constructor(private readonly endsitesService: EndSitesService) {}

  @Post()
  create(@Body() createEndsiteDto: CreateEndSiteDto, @GetUser() user: User) {
    return this.endsitesService.create(createEndsiteDto, user);
  }

  @Get()
  findAll(@Query() paginationEndSiteDto: PaginationEndSiteDto) {
    return this.endsitesService.findAll(paginationEndSiteDto);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.endsitesService.findOne(term);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateEndSiteDto: UpdateEndSiteDto,
  ) {
    return this.endsitesService.update(id, updateEndSiteDto);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin, ValidRoles.superUser)
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.endsitesService.remove(id);
  }

  @Get('activated/:id')
  activated(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.endsitesService.activated(id);
  }
}
