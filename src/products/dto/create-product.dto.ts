import { IsNumber, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name: string;

  @IsString()
  @MinLength(10)
  @IsUUID()
  category: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  measure: string;

  @IsString()
  @IsOptional()
  @IsUUID()
  storage: string;

  @IsNumber()
  @IsOptional()
  stock: number;
}
