import { IsString, IsOptional, IsInt, MaxLength } from 'class-validator';

export class UpdateTripStopDto {
  @IsOptional()
  @IsInt()
  cityId?: number | null;

  @IsString()
  @MaxLength(100)
  city: string;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string | null;
}
