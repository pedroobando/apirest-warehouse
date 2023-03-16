import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateStorageDto {
  @IsString()
  @MinLength(2)
  name: string;
}
