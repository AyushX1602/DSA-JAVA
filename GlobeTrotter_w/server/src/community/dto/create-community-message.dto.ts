import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateCommunityMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;
}
