import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('enrollments')
@Index(['studentId', 'subjectId'], { unique: true })
@Index(['semester'])
@Index(['status'])
export class EnrollmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  studentId: string;

  @Column({ type: 'varchar', length: 255 })
  subjectId: string;

  @Column({ type: 'varchar', length: 50 })
  semester: string; // 2024-1, 2024-2, etc.

  @Column({ type: 'varchar', length: 50 })
  status: string; // ACTIVE, DROPPED, COMPLETED, FAILED, PENDING

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  finalGrade: number;

  @Column({ type: 'integer', nullable: true })
  attendance: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  professor: string;

  @Column({ type: 'integer' })
  credits: number;

  @Column({ type: 'timestamp', nullable: true })
  enrollmentDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
