import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
// import { ApiProperty, PartialType } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto';

export class PaginationUserDto extends PartialType(PaginationDto) {
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  onlyActive?: boolean;
}
