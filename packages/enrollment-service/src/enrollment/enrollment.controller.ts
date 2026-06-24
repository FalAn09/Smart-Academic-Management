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

@ApiTags('Gestión de Matrículas (Enrollments)')
@Controller('api/v1/enrollments/data')
export class EnrollmentController {
  constructor(
    private readonly enrollmentService: EnrollmentService,
    @Inject(CACHE_MANAGER) private cacheManager: any,
  ) {}

  @ApiOperation({
    summary: 'Verificar salud del microservicio (Target Group AWS)',
  })
  @Get('health')
  healthCheck() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @ApiOperation({ summary: 'Crear un nuevo registro de matrícula' })
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
    summary: 'Obtener el listado completo de matrículas (Utiliza Caché Redis)',
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
    summary: 'Obtener todas las matrículas de un estudiante específico',
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

  @ApiOperation({ summary: 'Obtener los detalles de una matrícula por su ID' })
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
    summary: 'Actualizar el estado o datos de una matrícula existente',
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

  @ApiOperation({ summary: 'Eliminar un registro de matrícula' })
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
    summary: 'Validar disponibilidad de cupos para una asignatura',
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
