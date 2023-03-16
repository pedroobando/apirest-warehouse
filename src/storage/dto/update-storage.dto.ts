import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateStorageDto } from './create-storage.dto';

export class UpdateStorageDto extends PartialType(CreateStorageDto) {
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;
}
