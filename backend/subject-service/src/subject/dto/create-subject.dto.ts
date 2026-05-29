import { IsString, IsNumber, IsOptional, IsInt } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  credits: number;

  @IsInt()
  hours: number;

  @IsString()
  semester: string;

  @IsString()
  programId: string;

  @IsString()
  @IsOptional()
  professor?: string;

  @IsInt()
  maxCapacity: number;

  @IsString()
  @IsOptional()
  prerequisites?: string;
}
