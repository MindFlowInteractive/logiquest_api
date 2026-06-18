import { Controller, Get, Request } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { Reward } from './entities/reward.entity';

@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get('me')
  async getMyRewards(@Request() req): Promise<{ rewards: Reward[]; totalBalance: number }> {
    const userId = req.user.id;
    const rewards = await this.rewardsService.getRewardsByUser(userId);
    const totalBalance = rewards.reduce((sum, r) => sum + r.amount, 0);
    return { rewards, totalBalance };
  }

  @Get('balance')
  async getBalance(@Request() req): Promise<{ totalBalance: number }> {
    const userId = req.user.id;
    const totalBalance = await this.rewardsService.getTotalBalance(userId);
    return { totalBalance };
  }
}
