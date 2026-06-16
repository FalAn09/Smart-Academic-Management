import { PartialType } from '@nestjs/swagger';
import { CreateProgramDto } from './create-program.dto';

// PartialType hereda todas las validaciones del CreateDto pero las vuelve opcionales
export class UpdateProgramDto extends PartialType(CreateProgramDto) {}