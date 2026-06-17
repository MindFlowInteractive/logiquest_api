import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

describe('Config Validation', () => {
  const configFactory = () =>
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRY: Joi.string().required(),
        PORT: Joi.number().required(),
      }),
    });

  it('should fail when required env vars are missing', async () => {
    // Clear env vars
    delete process.env.DATABASE_URL;
    delete process.env.JWT_SECRET;
    delete process.env.JWT_EXPIRY;
    delete process.env.PORT;

    await expect(
      Test.createTestingModule({
        imports: [configFactory()],
      }).compile(),
    ).rejects.toThrow();
  });

  it('should succeed when all required env vars are provided', async () => {
    process.env.DATABASE_URL = 'postgres://test';
    process.env.JWT_SECRET = 'secret';
    process.env.JWT_EXPIRY = '1h';
    process.env.PORT = '3000';

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [configFactory()],
    }).compile();

    expect(moduleRef).toBeDefined();
    await moduleRef.close();
  });
});
