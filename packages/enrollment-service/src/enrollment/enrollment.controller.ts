import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Inject } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

// 1. APLICAMOS EL NAMESPACE Y USAMOS PLURAL
@Controller('api/v1/enrollments/data') 
export class EnrollmentController {
  constructor(
    private readonly enrollmentService: EnrollmentService,
    @Inject(CACHE_MANAGER) private cacheManager: any,
  ) {}

  // 2. ENDPOINT DE SALUD PARA EL TARGET GROUP DE AWS
  @Get('health')
  healthCheck() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Post()
  async createEnrollment(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    const enrollment = await this.enrollmentService.create(createEnrollmentDto);
    await this.cacheManager.del('enrollments'); 
    return {
      statusCode: 201,
      message: 'Enrollment created successfully',
      data: enrollment,
    };
  }

  @Get()
  async getAllEnrollments() {
    const cached = await this.cacheManager.get('enrollments');
    if (cached) {
      return {
        statusCode: 200,
        message: 'Enrollments retrieved (cached)',
        data: cached,
      };
    }

    const enrollments = await this.enrollmentService.findAll();
    await this.cacheManager.set('enrollments', enrollments, 3600000);
    return {
      statusCode: 200,
      message: 'Enrollments retrieved',
      data: enrollments,
    };
  }

  @Get('student/:studentId')
  async getStudentEnrollments(@Param('studentId') studentId: string) {
    const enrollments = await this.enrollmentService.findByStudentId(studentId);
    return {
      statusCode: 200,
      message: 'Student enrollments retrieved',
      data: enrollments,
    };
  }

  @Get(':id')
  async getEnrollmentById(@Param('id') id: string) {
    const enrollment = await this.enrollmentService.findById(id);
    return {
      statusCode: 200,
      message: 'Enrollment retrieved',
      data: enrollment,
    };
  }

  @Put(':id')
  async updateEnrollment(
    @Param('id') id: string,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
  ) {
    const enrollment = await this.enrollmentService.update(id, updateEnrollmentDto);
    await this.cacheManager.del('enrollments');
    return {
      statusCode: 200,
      message: 'Enrollment updated successfully',
      data: enrollment,
    };
  }

  @Delete(':id')
  async deleteEnrollment(@Param('id') id: string) {
    await this.enrollmentService.delete(id);
    await this.cacheManager.del('enrollments');
    return {
      statusCode: 200,
      message: 'Enrollment deleted successfully',
    };
  }

  @Post('validate-quota')
  async validateQuota(
    @Body() data: { subjectId: string; requiredSpots: number },
  ) {
    const isValid = await this.enrollmentService.validateQuota(
      data.subjectId,
      data.requiredSpots,
    );
    return {
      statusCode: 200,
      message: 'Quota validation completed',
      data: { isValid },
    };
  }
}