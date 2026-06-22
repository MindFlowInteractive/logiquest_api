import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, { abortOnError: false });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT') || 3000;
    await app.listen(port);
    console.log(`Server running on port ${port}`);
  } catch (error: any) {
    console.error('\n================================================================');
    console.error('FATAL ERROR: Database connection failed or startup error occurred!');
    console.error(error.message || error);
    console.error('================================================================\n');
    process.exit(1);
  }
}
bootstrap();