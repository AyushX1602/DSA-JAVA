import { IsString, IsOptional, IsInt, MaxLength } from 'class-validator';

export class CreateTripStopDto {
  @IsOptional()
  @IsInt()
  cityId?: number;

  @IsString()
  @MaxLength(100)
  city: string;

  @IsString()
  startDate: string;

  @IsString()
  endDate: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}
