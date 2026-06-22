import { Module, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventName } from '../events/events.enum';
import { RewardGrantedPayload } from '../events/event-payloads';

@Injectable()
export class RewardsListener {
  @OnEvent(EventName.RewardGranted)
  async handleRewardGranted(payload: RewardGrantedPayload) {
    console.log('RewardsListener received RewardGranted:', payload);
  }
}

@Module({
  providers: [RewardsListener],
})
export class RewardsModule {}
