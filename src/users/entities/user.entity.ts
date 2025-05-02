import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import {
  IsEmail,
  IsNotEmpty,
  Length,
  IsBoolean,
  IsOptional,
  IsDate,
} from 'class-validator';
import { Exclude } from 'class-transformer';
import { UserPreference } from './user-preference.entity';
import { UserAchievement } from '../../modules/achievements/entities/user-achievement.entity';
import { AchievementProgress } from '../../modules/achievements/entities/achievement-progress.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Column()
  @IsNotEmpty()
  @Length(2, 50)
  firstName: string;

  @Column()
  @IsNotEmpty()
  @Length(2, 50)
  lastName: string;

  @Column()
  @IsNotEmpty()
  @Length(8, 100)
  @Exclude({ toPlainOnly: true }) // Prevents password from being returned in responses
  password: string;

  @Column({ nullable: true })
  @IsOptional()
  avatar?: string;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  gameProfile?: {
    level: number;
    experience: number;
    rank: string;
    achievements: string[];
  };

  @Column({ default: false })
  @IsBoolean()
  emailVerified: boolean;

  @Column({ default: true })
  @IsBoolean()
  isActive: boolean;

  @Column({ default: false })
  @IsBoolean()
  marketingConsent: boolean;

  @Column({ nullable: true })
  @IsDate()
  @IsOptional()
  lastLogin?: Date;

  @Column({ nullable: true })
  @IsDate()
  @IsOptional()
  dataExportRequested?: Date;

  @Column({ nullable: true })
  @IsDate()
  @IsOptional()
  dataDeletionRequested?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UserPreference, preference => preference.user)
  preferences: UserPreference[];

  @OneToMany(() => UserAchievement, userAchievement => userAchievement.user)
  achievements: UserAchievement[];

  @OneToMany(() => AchievementProgress, achievementProgress => achievementProgress.user)
  achievementProgresses: AchievementProgress[];
}
