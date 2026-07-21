/**
 * Shape returned by the admin translation endpoints.
 * Excludes internal DB fields that callers don't need.
 */
export class PuzzleTranslationResponseDto {
  id!: string;
  puzzleId!: string;
  locale!: string;
  title!: string;
  description!: string;
  hints!: Array<{ order: number; content: string }> | null;
  createdAt!: Date;
  updatedAt!: Date;
}
