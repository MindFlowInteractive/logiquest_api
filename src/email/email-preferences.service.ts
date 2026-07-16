import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailPreference } from './entities/email-preference.entity';
import { UpdateEmailPreferencesDto } from './dto/update-email-preferences.dto';

@Injectable()
export class EmailPreferencesService {
  constructor(
    @InjectRepository(EmailPreference)
    private readonly repo: Repository<EmailPreference>,
  ) {}

  /**
   * Returns the preferences for a user, creating defaults if none exist.
   */
  async getOrCreate(userId: string): Promise<EmailPreference> {
    let prefs = await this.repo.findOne({ where: { userId } });
    if (!prefs) {
      prefs = this.repo.create({ userId });
      prefs = await this.repo.save(prefs);
    }
    return prefs;
  }

  async update(
    userId: string,
    dto: UpdateEmailPreferencesDto,
  ): Promise<EmailPreference> {
    const prefs = await this.getOrCreate(userId);
    Object.assign(prefs, dto);
    return this.repo.save(prefs);
  }

  /**
   * Check whether a user has opted in to a specific email category.
   * Critical emails (welcome, password-reset) bypass this check.
   */
  async canReceiveAchievementEmails(userId: string): Promise<boolean> {
    const prefs = await this.repo.findOne({ where: { userId } });
    return prefs?.achievementEmails ?? true;
  }

  async canReceiveWeeklySummaryEmails(userId: string): Promise<boolean> {
    const prefs = await this.repo.findOne({ where: { userId } });
    return prefs?.weeklySummaryEmails ?? true;
  }

  async canReceiveMarketingEmails(userId: string): Promise<boolean> {
    const prefs = await this.repo.findOne({ where: { userId } });
    return prefs?.marketingEmails ?? true;
  }
}
