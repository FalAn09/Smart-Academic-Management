import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Inject,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProgramService } from './program.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@ApiTags('Academic Programs (Programs)')
@Controller('api/v1/programs/data')
export class ProgramController {
  constructor(
    private readonly programService: ProgramService,
    @Inject(CACHE_MANAGER) private cacheManager: any,
  ) {}

  @ApiOperation({
    summary: 'Verify the health of the microservice (Target Group AWS)',
  })
  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      service: 'program-service',
      timestamp: new Date().toISOString(),
    };
  }

  @ApiOperation({ summary: 'Create a new academic program' })
  @Post()
  async createProgram(@Body() createProgramDto: CreateProgramDto) {
    const program = await this.programService.create(createProgramDto);
    await this.cacheManager.del('programs');
    return {
      statusCode: 201,
      message: 'Program created successfully',
      data: program,
    };
  }

  @ApiOperation({
    summary: 'Get the list of all academic programs (Uses Redis Cache)',
  })
  @Get()
  async getAllPrograms() {
    const cached = await this.cacheManager.get('programs');
    if (cached) {
      return {
        statusCode: 200,
        message: 'Programs retrieved (cached)',
        data: cached,
      };
    }

    const programs = await this.programService.findAll();
    await this.cacheManager.set('programs', programs, 3600000);
    return {
      statusCode: 200,
      message: 'Programs retrieved',
      data: programs,
    };
  }

  @ApiOperation({ summary: 'Get details of a specific academic program' })
  @Get('detail/:id')
  async getProgramById(@Param('id', ParseUUIDPipe) id: string) {
    const program = await this.programService.findById(id);
    return {
      statusCode: 200,
      message: 'Program retrieved',
      data: program,
    };
  }

  @ApiOperation({
    summary: 'Update information of a specific academic program',
  })
  @Put('detail/:id')
  async updateProgram(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProgramDto: UpdateProgramDto,
  ) {
    const program = await this.programService.update(id, updateProgramDto);
    await this.cacheManager.del('programs');
    return {
      statusCode: 200,
      message: 'Program updated successfully',
      data: program,
    };
  }

  @ApiOperation({ summary: 'Delete a specific academic program' })
  @Delete('detail/:id')
  async deleteProgram(@Param('id', ParseUUIDPipe) id: string) {
    await this.programService.delete(id);
    await this.cacheManager.del('programs');
    return {
      statusCode: 200,
      message: 'Program deleted successfully',
    };
  }
}
