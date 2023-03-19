import { IsArray } from 'class-validator';

export class StockProductDto {
  @IsArray()
  stocks: productStock[];

  // @IsString()
  // @IsUUID()
  // @MinLength(5)
  // storage: string;

  // @IsNumber()
  // stock: number;
}

interface productStock {
  // id: string;
  stock: number;
  storageId: string;
}
