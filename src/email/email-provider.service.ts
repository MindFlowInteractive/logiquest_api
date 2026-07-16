import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as sgMail from '@sendgrid/mail';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

type EmailProvider = 'smtp' | 'sendgrid';

@Injectable()
export class EmailProviderService {
  private readonly logger = new Logger(EmailProviderService.name);
  private readonly provider: EmailProvider;
  private readonly fromAddress: string;
  private smtpTransporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    this.provider = (
      this.configService.get<string>('EMAIL_PROVIDER', 'smtp').toLowerCase()
    ) as EmailProvider;
    this.fromAddress = this.configService.get<string>(
      'EMAIL_FROM',
      'noreply@logiquest.app',
    );

    if (this.provider === 'sendgrid') {
      const apiKey = this.configService.get<string>('SENDGRID_API_KEY', '');
      if (!apiKey) {
        this.logger.warn('SENDGRID_API_KEY not set — SendGrid emails will fail at send time.');
      } else {
        sgMail.setApiKey(apiKey);
      }
    } else {
      this.smtpTransporter = nodemailer.createTransport({
        host: this.configService.get<string>('SMTP_HOST', 'localhost'),
        port: this.configService.get<number>('SMTP_PORT', 587),
        secure: this.configService.get<boolean>('SMTP_SECURE', false),
        auth: {
          user: this.configService.get<string>('SMTP_USER', ''),
          pass: this.configService.get<string>('SMTP_PASS', ''),
        },
      });
    }
  }

  async send(options: SendEmailOptions): Promise<void> {
    if (this.provider === 'sendgrid') {
      await this.sendViaSendGrid(options);
    } else {
      await this.sendViaSmtp(options);
    }
  }

  private async sendViaSendGrid(options: SendEmailOptions): Promise<void> {
    await sgMail.send({
      to: options.to,
      from: this.fromAddress,
      subject: options.subject,
      html: options.html,
    });
    this.logger.log(`Email sent via SendGrid to ${options.to}: ${options.subject}`);
  }

  private async sendViaSmtp(options: SendEmailOptions): Promise<void> {
    if (!this.smtpTransporter) {
      throw new Error('SMTP transporter is not initialised');
    }
    await this.smtpTransporter.sendMail({
      from: this.fromAddress,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    this.logger.log(`Email sent via SMTP to ${options.to}: ${options.subject}`);
  }

  /** Returns the active provider name — useful for health checks. */
  getProvider(): EmailProvider {
    return this.provider;
  }
}
