import { Throttle } from '@nestjs/throttler';

export const ThrottleOverride = (limit: number, ttl: number) =>
  Throttle({ default: { limit, ttl } });
