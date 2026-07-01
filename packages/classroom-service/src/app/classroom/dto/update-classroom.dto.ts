import { IsString, IsInt, Min, IsEnum, IsOptional } from 'class-validator';

export class UpdateClassroomDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  building?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @IsEnum(['TEORICA', 'LABORATORIO', 'VIRTUAL'])
  @IsOptional()
  type?: 'TEORICA' | 'LABORATORIO' | 'VIRTUAL';

  @IsEnum(['ACTIVE', 'MAINTENANCE', 'INACTIVE'])
  @IsOptional()
  status?: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
}