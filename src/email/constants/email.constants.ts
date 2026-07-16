export const EMAIL_QUEUE = 'email-queue';

export enum EmailJobType {
  SEND_WELCOME = 'send-welcome',
  SEND_PASSWORD_RESET = 'send-password-reset',
  SEND_ACHIEVEMENT_UNLOCKED = 'send-achievement-unlocked',
  SEND_WEEKLY_SUMMARY = 'send-weekly-summary',
  SEND_TEST = 'send-test',
}

export const MAX_EMAIL_RETRIES = 3;
