import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateActivityDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  expense: number;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;
}
