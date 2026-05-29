import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('subjects')
export class SubjectEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'integer' })
  credits: number;

  @Column({ type: 'integer' })
  hours: number;

  @Column({ type: 'varchar', length: 50 })
  semester: string; // 1, 2, 3, etc.

  @Column({ type: 'varchar', length: 255 })
  programId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  professor: string;

  @Column({ type: 'integer' })
  maxCapacity: number;

  @Column({ type: 'varchar', length: 50 })
  status: string; // ACTIVE, INACTIVE, DISCONTINUED

  @Column({ type: 'text', nullable: true })
  prerequisites: string; // JSON array of prerequisite subject IDs

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
