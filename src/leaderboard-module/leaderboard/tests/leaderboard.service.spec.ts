// src/leaderboard/tests/leaderboard.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { LeaderboardService } from '../services/leaderboard.service';
import { LeaderboardRepository } from '../repositories/leaderboard.repository';
import { LeaderboardEntryRepository } from '../repositories/leaderboard-entry.repository';
import { LeaderboardSnapshotRepository } from '../repositories/leaderboard-snapshot.repository';
import { Leaderboard, ScoringModel, ResetPeriod } from '../entities/leaderboard.entity';
import { LeaderboardEntry } from '../entities/leaderboard-entry.entity';
import { LeaderboardSnapshot } from '../entities/leaderboard-snapshot.entity';
import { CreateLeaderboardDto } from '../dtos/create-leaderboard.dto';
import { SubmitScoreDto } from '../dtos/submit-score.dto';
import { QueryLeaderboardDto, LeaderboardTimeFrame } from '../dtos/query-leaderboard.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

// Mock cache manager
const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

// Mock connection
const mockQueryRunner = {
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest