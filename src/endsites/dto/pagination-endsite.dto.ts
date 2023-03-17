import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto';

export class PaginationEndSiteDto extends PartialType(PaginationDto) {
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  onlyActive?: boolean;

  @IsOptional()
  @IsString()
  name?: string;
}
