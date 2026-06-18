import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reward, RewardType } from './entities/reward.entity';
import { PuzzleInstance } from '../puzzle-engine/models/puzzle-instance.model';

@Injectable()
export class RewardsService {
  constructor(
    @InjectRepository(Reward)
    private readonly rewardRepo: Repository<Reward>,
  ) {}

  /**
   * Grant a reward for a completed puzzle instance.
   * Prevents duplicate rewards for the same session.
   */
  async grantReward(instance: PuzzleInstance): Promise<Reward | undefined> {
    if (!instance.isCompleted || !instance.userId) return undefined;
    const existing = await this.rewardRepo.findOne({ where: { sessionId: instance.id } });
    if (existing) return existing;

    const base = 10; // base reward unit
    const difficulty = instance.puzzle.difficulty ?? 1;
    const score = typeof instance.getScore === 'function' ? instance.getScore() : 1;
    const amount = Math.round(base * difficulty * score);
    const reward = this.rewardRepo.create({
      userId: instance.userId,
      sessionId: instance.id,
      type: RewardType.STELLA,
      amount,
    });
    return this.rewardRepo.save(reward);
  }

  async getRewardsByUser(userId: string): Promise<Reward[]> {
    return this.rewardRepo.find({ where: { userId } });
  }

  async getTotalBalance(userId: string): Promise<number> {
    const rewards = await this.getRewardsByUser(userId);
    return rewards.reduce((sum, r) => sum + r.amount, 0);
  }
}
