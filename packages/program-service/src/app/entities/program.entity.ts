// packages/program-service/src/app/entities/program.entity.ts
export class Program {
  id: string; // UUID
  code: string; // Ej: "ISI-001" (Código único)
  name: string; // Ej: "Ingeniería en Sistemas de Información"
  description: string; // Descripción del perfil profesional
  totalSemesters: number; // Ej: 10 (Duración de la carrera)
  degreeTitle: string; // Ej: "Ingeniero/a en Sistemas"
  isActive: boolean; // Para soft-deletes (no borrar carreras históricas)
  createdAt: Date;
  updatedAt: Date;
}