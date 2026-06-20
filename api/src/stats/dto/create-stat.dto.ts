import {
  IsBoolean,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateStatDto {
  @IsMongoId()
  player: string;

  @IsOptional()
  @IsMongoId()
  match?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  goals?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  assists?: number;

  @IsOptional()
  @IsBoolean()
  manOfTheMatch?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  yellowCards?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  redCards?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string;
}
