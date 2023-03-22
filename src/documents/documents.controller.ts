import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Patch,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto, CancelDocumentDto, PaginationDocumentDto } from './dto';

@Auth()
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  create(@Body() createDocumentDto: CreateDocumentDto, @GetUser() user: User) {
    return this.documentsService.create(createDocumentDto, user);
  }

  @Get()
  findAll(@Query() paginationDocumentDto: PaginationDocumentDto) {
    return this.documentsService.findAll(paginationDocumentDto);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.documentsService.findOne(term);
  }

  @Patch(':id')
  cancel(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() cancelDocumentDto: CancelDocumentDto,
    @GetUser() user: User,
  ) {
    return this.documentsService.cancel(id, cancelDocumentDto, user);
  }
}
