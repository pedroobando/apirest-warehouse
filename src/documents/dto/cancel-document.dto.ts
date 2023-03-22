import { IsString, MaxLength, MinLength } from 'class-validator';

export class CancelDocumentDto {
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  comentaryCancel: string;
}
