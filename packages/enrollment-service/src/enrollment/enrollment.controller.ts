import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@ApiTags('Enrollments management (Enrollments)')
@Controller('api/v1/enrollments/data')
export class EnrollmentController {
  constructor(
    private readonly enrollmentService: EnrollmentService,
    @Inject(CACHE_MANAGER) private cacheManager: any,
  ) {}

  @ApiOperation({
    summary: 'Verify the health of the microservice (Target Group AWS)',
  })
  @Get('health')
  healthCheck() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @ApiOperation({ summary: 'Create a new enrollment record' })
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

  @ApiOperation({
    summary: 'Get the list of all enrollments (Uses Redis Cache)',
  })
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

  @ApiOperation({
    summary: 'Get all enrollments for a specific student',
  })
  @Get('student/:studentId')
  async getStudentEnrollments(@Param('studentId') studentId: string) {
    const enrollments = await this.enrollmentService.findByStudentId(studentId);
    return {
      statusCode: 200,
      message: 'Student enrollments retrieved',
      data: enrollments,
    };
  }

  @ApiOperation({ summary: 'Get details of a specific enrollment' })
  @Get(':id')
  async getEnrollmentById(@Param('id') id: string) {
    const enrollment = await this.enrollmentService.findById(id);
    return {
      statusCode: 200,
      message: 'Enrollment retrieved',
      data: enrollment,
    };
  }

  @ApiOperation({
    summary: 'Update information of a specific enrollment',
  })
  @Put(':id')
  async updateEnrollment(
    @Param('id') id: string,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
  ) {
    const enrollment = await this.enrollmentService.update(
      id,
      updateEnrollmentDto,
    );
    await this.cacheManager.del('enrollments');
    return {
      statusCode: 200,
      message: 'Enrollment updated successfully',
      data: enrollment,
    };
  }

  @ApiOperation({ summary: 'Delete a specific enrollment record' })
  @Delete(':id')
  async deleteEnrollment(@Param('id') id: string) {
    await this.enrollmentService.delete(id);
    await this.cacheManager.del('enrollments');
    return {
      statusCode: 200,
      message: 'Enrollment deleted successfully',
    };
  }

  @ApiOperation({
    summary: 'Validate availability of spots for a specific subject',
  })
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
