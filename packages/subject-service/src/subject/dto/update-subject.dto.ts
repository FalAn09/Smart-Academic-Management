import { IsOptional, IsString, IsNumber, IsInt } from 'class-validator';

export class UpdateSubjectDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  credits?: number;

  @IsInt()
  @IsOptional()
  hours?: number;

  @IsString()
  @IsOptional()
  professor?: string;

  @IsInt()
  @IsOptional()
  maxCapacity?: number;

  @IsString()
  @IsOptional()
  status?: string;
}
