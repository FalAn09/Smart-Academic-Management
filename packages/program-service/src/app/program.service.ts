import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program } from './entities/program.entity';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';

@Injectable()
export class ProgramService {
  constructor(
    @InjectRepository(Program)
    private programRepository: Repository<Program>,
  ) {}

  async create(createProgramDto: CreateProgramDto): Promise<Program> {
    const program = this.programRepository.create(createProgramDto);
    return await this.programRepository.save(program);
  }

  async findAll(): Promise<Program[]> {
    return await this.programRepository.find({
      where: { isActive: true }, // Solo traemos las carreras activas
      order: { name: 'ASC' }, // Ordenadas alfabéticamente
    });
  }

  async findById(id: string): Promise<Program> {
    const program = await this.programRepository.findOne({ where: { id } });
    if (!program) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }
    return program;
  }

  async update(
    id: string,
    updateProgramDto: UpdateProgramDto,
  ): Promise<Program> {
    const program = await this.findById(id);
    Object.assign(program, updateProgramDto);
    return await this.programRepository.save(program);
  }

  async delete(id: string): Promise<void> {
    const program = await this.findById(id);
    // Soft-delete: en lugar de borrar la carrera, la desactivamos para no romper el historial de matrículas
    program.isActive = false;
    await this.programRepository.save(program);
  }
}
