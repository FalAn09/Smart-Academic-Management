import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  Put 
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ClassroomService } from './classroom.service';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';

// 1. Normalizamos el título de la sección en Swagger
@ApiTags('Gestión de Aulas (Classrooms)') 
// 2. Agregamos el sub-path "/data" al controlador
@Controller('classrooms/data') 
export class ClassroomController {
  constructor(private readonly classroomService: ClassroomService) {}

  // =======================================================
  // ENDPOINT DE SALUD (AWS TARGET GROUP)
  // =======================================================
  @Get('health')
  @ApiOperation({ summary: 'Verificar salud del microservicio (Target Group AWS)' })
  checkHealth() {
    return { 
      status: 'ok', 
      service: 'classroom-service', 
      timestamp: new Date().toISOString() 
    };
  }

  // =======================================================
  // OPERACIONES CRUD
  // =======================================================
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo registro de aula' })
  create(@Body() createClassroomDto: CreateClassroomDto) {
    return this.classroomService.create(createClassroomDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener la lista de todas las aulas' })
  findAll() {
    return this.classroomService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener los detalles de un aula específica' })
  findOne(@Param('id') id: string) {
    return this.classroomService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar la información de un registro de aula' })
  update(@Param('id') id: string, @Body() updateClassroomDto: UpdateClassroomDto) {
    return this.classroomService.update(id, updateClassroomDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un registro de aula' })
  remove(@Param('id') id: string) {
    return this.classroomService.remove(id);
  }
}