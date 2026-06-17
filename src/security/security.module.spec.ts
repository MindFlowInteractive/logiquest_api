import { Test, TestingModule } from '@nestjs/testing';
import { APP_GUARD } from '@nestjs/core';
import { Reflector } from '@nestjs/core';
import { ThrottlerStorage, ThrottlerModuleOptions } from '@nestjs/throttler';
import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { CustomThrottlerGuard } from './guards/custom-throttler.guard';
import { ThrottleOverride } from './decorators/throttle-override.decorator';
import { SecurityModule } from './security.module';

const THROTTLER_LIMIT = 'THROTTLER:LIMIT';
const THROTTLER_TTL = 'THROTTLER:TTL';

describe('SecurityModule', () => {
  let module: TestingModule;

  const mockStorage: ThrottlerStorage = {
    increment: jest.fn(),
  } as any;

  const mockReflector = new Reflector();

  describe('Global guard registration', () => {
    it('should register CustomThrottlerGuard as APP_GUARD', async () => {
      const testModule: TestingModule = await Test.createTestingModule({
        imports: [SecurityModule],
      }).compile();

      const app = testModule.createNestApplication();
      await app.init();

      const moduleDef: any = Reflect.getMetadata('providers', SecurityModule) || [];
      const hasAppGuardProvider = moduleDef.some((p: any) => {
        if (p && p.provide) {
          return p.provide === APP_GUARD && p.useClass === CustomThrottlerGuard;
        }
        return false;
      });

      expect(hasAppGuardProvider).toBe(true);

      await app.close();
      await testModule.close();
    });
  });

  describe('CustomThrottlerGuard', () => {
    let guard: CustomThrottlerGuard;

    beforeEach(async () => {
      module = await Test.createTestingModule({
        providers: [
          CustomThrottlerGuard,
          {
            provide: ThrottlerStorage,
            useValue: mockStorage,
          },
          {
            provide: Reflector,
            useValue: mockReflector,
          },
          {
            provide: 'THROTTLER:MODULE_OPTIONS',
            useValue: {
              throttlers: [{ limit: 100, ttl: 60 }],
            } as ThrottlerModuleOptions,
          },
        ],
      }).compile();

      guard = module.get<CustomThrottlerGuard>(CustomThrottlerGuard);
    });

    afterEach(async () => {
      if (module) {
        await module.close();
      }
    });

    it('should throw 429 HttpException when limit exceeded', async () => {
      const mockResponse: any = {
        header: jest.fn(),
      };
      const mockContext = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
          getRequest: () => ({}),
        }),
      } as unknown as ExecutionContext;

      const throttlerLimitDetail = {
        ttl: 45,
        limit: 10,
        key: 'test',
        tracker: '127.0.0.1',
        totalHits: 11,
        timeToExpire: 45000,
        isBlocked: false,
        blockDuration: 0,
      };

      let thrownError: any;
      try {
        await (guard as any).throwThrottlingException(mockContext, throttlerLimitDetail);
      } catch (error) {
        thrownError = error;
      }

      expect(thrownError).toBeInstanceOf(HttpException);
      expect(thrownError.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
      expect(mockResponse.header).toHaveBeenCalledWith('Retry-After', '45');
    });

    it('should return 429 response with correct shape including retryAfter', async () => {
      const mockResponse: any = { header: jest.fn() };
      const mockContext = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
          getRequest: () => ({}),
        }),
      } as unknown as ExecutionContext;

      const throttlerLimitDetail = {
        ttl: 30,
        limit: 5,
        key: 'test2',
        tracker: 'ip',
        totalHits: 6,
        timeToExpire: 30000,
        isBlocked: false,
        blockDuration: 0,
      };

      let thrownError: any;
      try {
        await (guard as any).throwThrottlingException(mockContext, throttlerLimitDetail);
      } catch (error) {
        thrownError = error;
      }

      const response = thrownError.getResponse();
      expect(response).toEqual({
        statusCode: 429,
        message: 'Too Many Requests',
        retryAfter: 30,
      });
    });
  });

  describe('ThrottleOverride decorator', () => {
    it('should set correct metadata (limit and ttl) using default key', () => {
      class TestController {
        @ThrottleOverride(7, 15)
        someProtectedRoute() {
          return 'ok';
        }
      }

      const routeFn = TestController.prototype.someProtectedRoute;

      expect(Reflect.getMetadata(THROTTLER_LIMIT + 'default', routeFn)).toBe(7);
      expect(Reflect.getMetadata(THROTTLER_TTL + 'default', routeFn)).toBe(15);
    });
  });
});
