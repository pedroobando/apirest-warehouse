import { IsString, MinLength } from 'class-validator';

export class CreateEndSiteDto {
  @IsString()
  @MinLength(2)
  name: string;
}
