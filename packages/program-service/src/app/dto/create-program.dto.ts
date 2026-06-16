import { IsString, IsNotEmpty, IsInt, Min, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProgramDto {
  @ApiProperty({ example: 'ISI-001', description: 'Código único de la carrera' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Ingeniería en Sistemas de Información', description: 'Nombre completo de la carrera' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Formación de profesionales en el área de software...', description: 'Descripción de la carrera' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 10, description: 'Duración en semestres' })
  @IsInt()
  @Min(1)
  totalSemesters: number;

  @ApiProperty({ example: 'Ingeniero/a en Sistemas', description: 'Título que otorga' })
  @IsString()
  @IsNotEmpty()
  degreeTitle: string;

  @ApiPropertyOptional({ example: true, description: 'Estado activo de la carrera' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}