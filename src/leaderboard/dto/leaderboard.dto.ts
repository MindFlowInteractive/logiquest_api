export class LeaderboardQueryDto {
  /** Number of items per page */
  limit?: number = 20;
  /** Page number, starting at 1 */
  page?: number = 1;
  /** Optional puzzle category filter */
  category?: string;
}

export class LeaderboardEntryDto {
  userId: string;
  totalScore: number;
  category?: string;
  rank: number;
}
