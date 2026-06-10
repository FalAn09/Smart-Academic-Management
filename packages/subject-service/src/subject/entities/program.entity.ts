import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('programs')
export class ProgramEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  level: string; // BACHELOR, MASTER, DOCTORATE

  @Column({ type: 'integer' })
  totalCredits: number;

  @Column({ type: 'varchar', length: 50 })
  status: string; // ACTIVE, INACTIVE

  @Column({ type: 'varchar', length: 255 })
  faculty: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
