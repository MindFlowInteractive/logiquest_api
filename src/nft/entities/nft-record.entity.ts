import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('nft_records')
@Index(['userId', 'achievementId'], { unique: true })
export class NFTRecord {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  mintId!: string;

  @Column()
  userId!: string;

  @Column()
  achievementId!: string;

  @Column()
  txHash!: string;

  @Column()
  chain!: string;

  @CreateDateColumn()
  mintedAt!: Date;
}
