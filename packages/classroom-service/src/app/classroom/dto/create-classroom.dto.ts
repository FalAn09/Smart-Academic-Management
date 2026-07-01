import { IsString, IsNotEmpty, IsInt, Min, IsEnum, IsOptional } from 'class-validator';

export class CreateClassroomDto {
  @IsString()
  @IsNotEmpty({ message: 'El código del aula no puede estar vacío.' })
  code: string;

  @IsString()
  @IsNotEmpty({ message: 'Debe especificar el edificio o bloque.' })
  building: string;

  @IsInt()
  @Min(1, { message: 'La capacidad debe ser de al menos 1 estudiante.' })
  capacity: number;

  @IsEnum(['TEORICA', 'LABORATORIO', 'VIRTUAL'], {
    message: 'El tipo de aula debe ser TEORICA, LABORATORIO o VIRTUAL.',
  })
  @IsOptional()
  type?: 'TEORICA' | 'LABORATORIO' | 'VIRTUAL';

  @IsEnum(['ACTIVE', 'MAINTENANCE', 'INACTIVE'])
  @IsOptional()
  status?: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
}