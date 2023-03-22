import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  dateCreate: string;

  @IsString()
  @MinLength(2)
  @MaxLength(10)
  numberDoc: string;

  @IsString()
  @MinLength(2)
  @MaxLength(150)
  peopleName: string;

  @IsString()
  @IsIn(['in_buy', 'out_delivery', 'adj_doc', 'out_job'])
  docType: string;

  @IsString()
  @MinLength(10)
  @MaxLength(500)
  comentary: string;

  @IsArray()
  @IsOptional()
  details: createDetailDto[];
}

export class createDetailDto {
  @IsString()
  @IsUUID('4')
  productStockId: string;

  @IsNumber()
  quantity: number;
}
