import { Logger } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { LoggingMiddleware } from './logging.middleware';

describe('LoggingMiddleware', () => {
  let middleware: LoggingMiddleware;
  let finishHandler: () => void;

  const buildReqRes = (statusCode: number) => {
    const req = { method: 'GET', originalUrl: '/health/ready' } as Request;
    const res = {
      statusCode,
      on: jest.fn((event: string, handler: () => void) => {
        if (event === 'finish') finishHandler = handler;
      }),
    } as unknown as Response;
    return { req, res };
  };

  beforeEach(() => {
    middleware = new LoggingMiddleware();
  });

  afterEach(() => jest.restoreAllMocks());

  it('calls next() so the request continues through the pipeline', () => {
    const next = jest.fn() as unknown as NextFunction;
    const { req, res } = buildReqRes(200);

    middleware.use(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('logs method, path, status and duration once the response finishes', () => {
    const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    const { req, res } = buildReqRes(200);

    middleware.use(req, res, jest.fn() as unknown as NextFunction);
    finishHandler();

    expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(/^GET \/health\/ready 200 \d/));
  });

  it('logs at warn level for 4xx responses', () => {
    const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    const { req, res } = buildReqRes(404);

    middleware.use(req, res, jest.fn() as unknown as NextFunction);
    finishHandler();

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('404'));
  });

  it('logs at error level for 5xx responses', () => {
    const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    const { req, res } = buildReqRes(503);

    middleware.use(req, res, jest.fn() as unknown as NextFunction);
    finishHandler();

    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('503'));
  });
});
