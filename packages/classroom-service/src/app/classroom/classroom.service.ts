import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassroomEntity } from './entities/classroom.entity';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';

@Injectable()
export class ClassroomService {
  constructor(
    @InjectRepository(ClassroomEntity)
    private readonly classroomRepository: Repository<ClassroomEntity>,
  ) {}

  // 1. Crear un aula nueva
  async create(createClassroomDto: CreateClassroomDto): Promise<ClassroomEntity> {
    const existingClassroom = await this.classroomRepository.findOne({
      where: { code: createClassroomDto.code },
    });

    if (existingClassroom) {
      throw new ConflictException(
        `El código de aula '${createClassroomDto.code}' ya está registrado.`
      );
    }

    const classroom = this.classroomRepository.create(createClassroomDto);
    return await this.classroomRepository.save(classroom);
  }

  // 2. Obtener todas las aulas
  async findAll(): Promise<ClassroomEntity[]> {
    return await this.classroomRepository.find({
      order: { code: 'ASC' }, // Las ordenamos alfabéticamente por código
    });
  }

  // 3. Obtener una sola aula por su ID
  async findOne(id: string): Promise<ClassroomEntity> {
    const classroom = await this.classroomRepository.findOne({
      where: { id },
    });

    if (!classroom) {
      throw new NotFoundException(`El aula con ID ${id} no existe.`);
    }

    return classroom;
  }

  // 4. Editar un aula existente
  async update(
    id: string,
    updateClassroomDto: UpdateClassroomDto,
  ): Promise<ClassroomEntity> {
    const classroom = await this.findOne(id);

    // Si se intenta actualizar el código, validamos que no pertenezca a otra aula
    if (updateClassroomDto.code && updateClassroomDto.code !== classroom.code) {
      const existingClassroom = await this.classroomRepository.findOne({
        where: { code: updateClassroomDto.code },
      });
      if (existingClassroom) {
        throw new ConflictException(
          `El código de aula '${updateClassroomDto.code}' ya está en uso por otra instancia.`
        );
      }
    }

    Object.assign(classroom, updateClassroomDto);
    return await this.classroomRepository.save(classroom);
  }

  // 5. Eliminar un aula
  async remove(id: string): Promise<void> {
    const classroom = await this.findOne(id);
    await this.classroomRepository.remove(classroom);
  }
}