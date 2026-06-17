import { Module } from '@nestjs/common';
import { HintsModule } from './hints/hints.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { SessionsModule } from './sessions/sessions.module';
import { ScoringModule } from './scoring/scoring.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      autoLoadEntities: true,
      synchronize: true,
    }),
    SessionsModule,
    ScoringModule,
    HintsModule,
    UsersModule,
  ],
})
export class AppModule {}
