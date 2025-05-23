import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WalletModule } from './wallet/wallet.module';
import { AuthModule } from './auth/auth.module';
import { NFTMetadataModule } from './nft-metadata/nft-metadata.module';
import { UsersModule } from './users/users.module';
import { AchievementsModule } from './modules/achievements/achievements.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.example', 
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
      username: process.env.DATABASE_USER || 'lagodxy',
      password: process.env.DATABASE_PASSWORD || '4633922',
      database: process.env.DATABASE_NAME || 'test',
      autoLoadEntities: true,
      synchronize: true, // Don't use in production unless you know what you're doing
    }),
    
    WalletModule,
    AuthModule,
    NFTMetadataModule,
    UsersModule,
    AchievementsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
