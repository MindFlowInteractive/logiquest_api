import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  action!: string;

  @Column()
  performedBy!: string;

  @Column({ nullable: true })
  targetId!: string;

  @Column({ type: 'json', nullable: true })
  metadata!: object;

  @CreateDateColumn()
  createdAt!: Date;
}
