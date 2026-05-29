import { Controller, Get, Post, Body, Param, Put, Delete, Inject } from '@nestjs/common';
import { SubjectService } from './subject.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Controller('api/v1/subjects')
export class SubjectController {
  constructor(
    private readonly subjectService: SubjectService,
    @Inject(CACHE_MANAGER) private cacheManager: any,
  ) {}

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

  @Get(':id')
  async getSubjectById(@Param('id') id: string) {
    const subject = await this.subjectService.findById(id);
    return {
      statusCode: 200,
      message: 'Subject retrieved',
      data: subject,
    };
  }

  @Put(':id')
  async updateSubject(
    @Param('id') id: string,
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

  @Delete(':id')
  async deleteSubject(@Param('id') id: string) {
    await this.subjectService.delete(id);
    await this.cacheManager.del('subjects');
    return {
      statusCode: 200,
      message: 'Subject deleted successfully',
    };
  }
}
