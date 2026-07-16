import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EMAIL_QUEUE } from './constants/email.constants';
import { EmailService } from './email.service';
import { EmailProcessor } from './email.processor';
import { EmailTemplateService } from './email-template.service';
import { EmailProviderService } from './email-provider.service';
import { EmailPreferencesService } from './email-preferences.service';
import { EmailPreference } from './entities/email-preference.entity';
import { AdminEmailController } from './admin-email.controller';
import { UserEmailPreferencesController } from './user-email-preferences.controller';

@Module({
  imports: [
    BullModule.registerQueue({
      name: EMAIL_QUEUE,
    }),
    TypeOrmModule.forFeature([EmailPreference]),
  ],
  controllers: [AdminEmailController, UserEmailPreferencesController],
  providers: [
    EmailService,
    EmailProcessor,
    EmailTemplateService,
    EmailProviderService,
    EmailPreferencesService,
  ],
  exports: [EmailService, EmailPreferencesService],
})
export class EmailModule {}
