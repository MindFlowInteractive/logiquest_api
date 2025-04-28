import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('analytics_events')
export class AnalyticsEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventType: string;

  @Column({ type: 'jsonb' })
  payload: any;

  @Column()
  userId: string;

  @Column({ nullable: true })
  sessionId: string;

  @CreateDateColumn()
  @Index()
  createdAt: Date;
}
