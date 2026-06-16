export interface SessionCompletedPayload {
  sessionId: string;
  userId: string;
  // any other relevant fields
}

export interface ScoreUpdatedPayload {
  sessionId: string;
  newScore: number;
}

export interface AchievementUnlockedPayload {
  userId: string;
  achievementId: string;
}

export interface RewardGrantedPayload {
  userId: string;
  rewardId: string;
}
