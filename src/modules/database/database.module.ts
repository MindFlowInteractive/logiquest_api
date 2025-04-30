import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Category } from '../entities/category.entity';
import { Tag } from '../entities/tag.entity';
import { Difficulty } from '../entities/difficulty.entity';
import { Puzzle } from '../entities/puzzle.entity';
import { PuzzleVersion } from '../entities/puzzle-version.entity';
import { PuzzleTranslation } from '../entities/puzzle-translation.entity';
import { SolutionValidation } from '../entities/solution-validation.entity';
import { UserPuzzleProgress } from '../entities/user-puzzle-progress.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'password'),
        database: configService.get('DB_NAME', 'logiquest'),
        entities: [
          Category,
          Tag,
          Difficulty,
          Puzzle,
          PuzzleVersion,
          PuzzleTranslation,
          SolutionValidation,
          UserPuzzleProgress
        ],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') !== 'production',
      }),
    }),
    TypeOrmModule.forFeature([
      Category,
      Tag,
      Difficulty,
      Puzzle,
      PuzzleVersion,
      PuzzleTranslation,
      SolutionValidation,
      UserPuzzleProgress
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}