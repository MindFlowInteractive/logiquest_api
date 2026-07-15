import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRY: Joi.string().required(),
        PORT: Joi.number().required(),
        CALIBRATION_AUTO_APPLY: Joi.string().valid('true', 'false').default('false'),
      }),
    }),
  ],
  exports: [NestConfigModule],
})
export class AppConfigModule {}
