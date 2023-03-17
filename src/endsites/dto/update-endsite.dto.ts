import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateEndSiteDto } from './create-endsite.dto';

export class UpdateEndSiteDto extends PartialType(CreateEndSiteDto) {
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;
}
