import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

export enum ConditionType {
  PUZZLES_SOLVED = 'puzzles_solved',
  HARD_PUZZLES_WITHOUT_HINTS = 'hard_puzzles_without_hints',
}

export enum Rarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
}

@Entity('achievements')
@Unique(['name'])
export class Achievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ type: 'enum', enum: ConditionType })
  conditionType: ConditionType;

  @Column('int')
  threshold: number;

  @Column({ type: 'enum', enum: Rarity })
  rarity: Rarity;
}
