import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('classrooms')
export class ClassroomEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string; // Ej: "A-204", "LAB-COMP-1"

  @Column()
  building: string; // Ej: "Bloque de Informática", "Edificio Central"

  @Column({ type: 'int' })
  capacity: number; // Capacidad máxima de estudiantes

  @Column({
    type: 'varchar',
    default: 'TEORICA',
  })
  type: 'TEORICA' | 'LABORATORIO' | 'VIRTUAL';

  @Column({
    type: 'varchar',
    default: 'ACTIVE',
  })
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}