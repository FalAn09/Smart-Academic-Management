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
@ApiTags('Classrooms management (Classrooms)') 
// 2. Agregamos el sub-path "/data" al controlador
@Controller('classrooms/data') 
export class ClassroomController {
  constructor(private readonly classroomService: ClassroomService) {}

  // =======================================================
  // ENDPOINT DE SALUD (AWS TARGET GROUP)
  // =======================================================
  @Get('health')
  @ApiOperation({ summary: 'Verify the health of the microservice (Target Group AWS)' })
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
  @ApiOperation({ summary: 'Create a new classroom record' })
  create(@Body() createClassroomDto: CreateClassroomDto) {
    return this.classroomService.create(createClassroomDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get the list of all classrooms' })
  findAll() {
    return this.classroomService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific classroom' })
  findOne(@Param('id') id: string) {
    return this.classroomService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update information of a specific classroom' })
  update(@Param('id') id: string, @Body() updateClassroomDto: UpdateClassroomDto) {
    return this.classroomService.update(id, updateClassroomDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a specific classroom record' })
  remove(@Param('id') id: string) {
    return this.classroomService.remove(id);
  }
}