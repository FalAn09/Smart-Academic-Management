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
import { SubjectService } from './subject.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

// 1. NAMESPACE EXCLUSIVO EN PLURAL
@Controller('api/v1/subjects/data')
export class SubjectController {
  constructor(
    private readonly subjectService: SubjectService,
    @Inject(CACHE_MANAGER) private cacheManager: any,
  ) {}

  // 2. ENDPOINT DE SALUD PARA EL TARGET GROUP DE AWS
  @Get('health')
  healthCheck() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Post()
  async createSubject(@Body() createSubjectDto: CreateSubjectDto) {
    const subject = await this.subjectService.create(createSubjectDto);
    await this.cacheManager.del('subjects');
    return {
      statusCode: 201,
      message: 'Subject created successfully',
      data: subject,
    };
  }

  @Get()
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
    await this.cacheManager.set('subjects', subjects, 3600000);
    return {
      statusCode: 200,
      message: 'Subjects retrieved',
      data: subjects,
    };
  }

  @Get('program/:programId')
  async getSubjectsByProgram(@Param('programId') programId: string) {
    const subjects = await this.subjectService.findByProgram(programId);
    return {
      statusCode: 200,
      message: 'Program subjects retrieved',
      data: subjects,
    };
  }

  @Get('code/:code')
  async getSubjectByCode(@Param('code') code: string) {
    const subject = await this.subjectService.findByCode(code);
    return {
      statusCode: 200,
      message: 'Subject retrieved',
      data: subject,
    };
  }

  @Get('detail/:id')
  async getSubjectById(@Param('id', ParseUUIDPipe) id: string) {
    const subject = await this.subjectService.findById(id);
    return {
      statusCode: 200,
      message: 'Subject retrieved',
      data: subject,
    };
  }

  @Put('detail/:id')
  async updateSubject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSubjectDto: UpdateSubjectDto,
  ) {
    const subject = await this.subjectService.update(id, updateSubjectDto);
    await this.cacheManager.del('subjects');
    return {
      statusCode: 200,
      message: 'Subject updated successfully',
      data: subject,
    };
  }

  @Delete('detail/:id')
  async deleteSubject(@Param('id', ParseUUIDPipe) id: string) {
    await this.subjectService.delete(id);
    await this.cacheManager.del('subjects');
    return {
      statusCode: 200,
      message: 'Subject deleted successfully',
    };
  }
}