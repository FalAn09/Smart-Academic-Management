import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Put, 
  Delete, 
  Inject, 
  ParseUUIDPipe 
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger'; // 👈 IMPORTACIONES DE SWAGGER
import { SubjectService } from './subject.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

// 1. NAMESPACE EXCLUSIVO EN PLURAL Y ETIQUETA DE SWAGGER
@ApiTags('Subjects management (Subjects)') // 👈 AGRUPADOR VISUAL PARA LA DOCUMENTACIÓN
@Controller('api/v1/subjects/data')
export class SubjectController {
  constructor(
    private readonly subjectService: SubjectService,
    @Inject(CACHE_MANAGER) private cacheManager: any,
  ) {}

  // 2. ENDPOINT DE SALUD PARA EL TARGET GROUP DE AWS
  @Get('health')
  @ApiOperation({ summary: 'Verify the health of the microservice (Target Group AWS)' })
  healthCheck() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new subject record' })
  async createSubject(@Body() createSubjectDto: CreateSubjectDto) {
    const subject = await this.subjectService.create(createSubjectDto);
    await this.cacheManager.del('subjects'); // Invalidar caché al crear
    return {
      statusCode: 201,
      message: 'Subject created successfully',
      data: subject,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get the list of all subjects (Supported by Redis Cache)' })
  async getAllSubjects() {
    const cached = await this.cacheManager.get('subjects');
    if (cached) {
      return {
        statusCode: 200,
        message: 'Subjects retrieved (cached)',
        data: cached,
      };
    }

    const subjects = await this.subjectService.findAll();
    await this.cacheManager.set('subjects', subjects, 3600000); // 1 hora de caché
    return {
      statusCode: 200,
      message: 'Subjects retrieved',
      data: subjects,
    };
  }

  @Get('program/:programId')
  @ApiOperation({ summary: 'Get subjects filtered by academic program ID' })
  async getSubjectsByProgram(@Param('programId') programId: string) {
    const subjects = await this.subjectService.findByProgram(programId);
    return {
      statusCode: 200,
      message: 'Program subjects retrieved',
      data: subjects,
    };
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get details of a specific subject by its code' })
  async getSubjectByCode(@Param('code') code: string) {
    const subject = await this.subjectService.findByCode(code);
    return {
      statusCode: 200,
      message: 'Subject retrieved',
      data: subject,
    };
  }

  @Get('detail/:id')
  @ApiOperation({ summary: 'Get details of a specific subject by its ID' })
  async getSubjectById(@Param('id', ParseUUIDPipe) id: string) {
    const subject = await this.subjectService.findById(id);
    return {
      statusCode: 200,
      message: 'Subject retrieved',
      data: subject,
    };
  }

  @Put('detail/:id')
  @ApiOperation({ summary: 'Update information of a specific subject' })
  async updateSubject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSubjectDto: UpdateSubjectDto,
  ) {
    const subject = await this.subjectService.update(id, updateSubjectDto);
    await this.cacheManager.del('subjects'); // Invalidar caché al actualizar
    return {
      statusCode: 200,
      message: 'Subject updated successfully',
      data: subject,
    };
  }

  @Delete('detail/:id')
  @ApiOperation({ summary: 'Delete a specific subject record' })
  async deleteSubject(@Param('id', ParseUUIDPipe) id: string) {
    await this.subjectService.delete(id);
    await this.cacheManager.del('subjects'); // Invalidar caché al borrar
    return {
      statusCode: 200,
      message: 'Subject deleted successfully',
    };
  }
}