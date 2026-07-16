import { EmailJobType } from '../constants/email.constants';

export interface EmailJobPayload {
  to: string;
  type: EmailJobType;
  context: Record<string, unknown>;
}

export interface WelcomeEmailContext {
  username: string;
  loginUrl: string;
}

export interface PasswordResetEmailContext {
  username: string;
  resetUrl: string;
  expiresInMinutes: number;
}

export interface AchievementUnlockedEmailContext {
  username: string;
  achievementTitle: string;
  achievementDescription: string;
  achievementIconUrl?: string;
  profileUrl: string;
}

export interface WeeklySummaryEmailContext {
  username: string;
  weekStartDate: string;
  weekEndDate: string;
  puzzlesSolved: number;
  totalScore: number;
  rank: number;
  topAchievement?: string;
  dashboardUrl: string;
}
