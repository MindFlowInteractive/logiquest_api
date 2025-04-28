import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('analytics_configs')
export class AnalyticsConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  key: string;

  @Column()
  value: string;
}
