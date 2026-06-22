import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { AppConfigModule } from '../config/app-config.module';
import { Puzzle } from '../puzzles/entities/puzzle.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: (config: ConfigService) => {
        const nodeEnv = config.get<string>('NODE_ENV') || 'development';
        const isLocal = ['development', 'local', 'test'].includes(nodeEnv);
        return {
          type: 'postgres',
          url: config.get<string>('DATABASE_URL'),
          autoLoadEntities: true,
          synchronize: isLocal,
          retryAttempts: 1, // Minimize retry attempts so we exit fast
          logging: isLocal,
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Puzzle]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
