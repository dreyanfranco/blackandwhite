import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateMatchDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  opponent: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsIn(['home', 'away'])
  homeAway?: 'home' | 'away';

  @IsOptional()
  @IsString()
  @MaxLength(80)
  competition?: string;
}
