import { IsOptional, IsString, IsNumber, IsDecimal } from 'class-validator';

export class UpdateEnrollmentDto {
  @IsString()
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  finalGrade?: number;

  @IsNumber()
  @IsOptional()
  attendance?: number;

  @IsString()
  @IsOptional()
  professor?: string;
}
