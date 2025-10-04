import {
  IsString,
  MaxLength,
  IsOptional,
  IsDateString,
  IsNumber,
  Min,
  IsBoolean,
} from 'class-validator';

export class UpdateTripDto {
  @IsString()
  @IsOptional()
  @MaxLength(120)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  budget?: number;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
