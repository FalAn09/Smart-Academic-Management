import { IsString, IsUUID, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateEnrollmentDto {
  @IsString()
  studentId: string;

  @IsString()
  subjectId: string;

  @IsString()
  semester: string;

  @IsNumber()
  credits: number;

  @IsString()
  @IsOptional()
  professor?: string;
}
