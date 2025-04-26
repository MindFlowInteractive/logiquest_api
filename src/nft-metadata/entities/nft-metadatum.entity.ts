import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('nft_metadata')
export class NFTMetadata {
  @PrimaryGeneratedColumn('uuid')
  tokenId: string;

  @Column({ nullable: true })
  achievementId: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  image: string;

  @Column({ nullable: true })
  externalUrl: string;

  @Column({ nullable: true })
  backgroundColor: string;

  @Column({ nullable: true })
  animationUrl: string;

  @Column('jsonb', { nullable: true })
  attributes: any[];

  @Column()
  ipfsHash: string;

  @Column('jsonb')
  versionHistory: any[];

  @Column()
  currentVersion: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
