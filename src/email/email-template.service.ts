import { Injectable, Logger } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class EmailTemplateService {
  private readonly logger = new Logger(EmailTemplateService.name);
  private readonly templateCache = new Map<string, HandlebarsTemplateDelegate>();

  /**
   * Compile and cache a Handlebars template from the templates directory.
   * Falls back to an inline template if the file is missing.
   */
  compile(templateName: string, context: Record<string, unknown>): string {
    let template = this.templateCache.get(templateName);

    if (!template) {
      const templatePath = path.join(__dirname, 'templates', `${templateName}.hbs`);
      if (fs.existsSync(templatePath)) {
        const source = fs.readFileSync(templatePath, 'utf-8');
        template = Handlebars.compile(source);
      } else {
        // Fall back to inline templates
        const inlineSource = this.getInlineTemplate(templateName);
        template = Handlebars.compile(inlineSource);
        this.logger.warn(`Template file not found for "${templateName}", using inline fallback.`);
      }
      this.templateCache.set(templateName, template);
    }

    return template(context);
  }

  /** Clears compiled template cache (useful for testing). */
  clearCache(): void {
    this.templateCache.clear();
  }

  private getInlineTemplate(templateName: string): string {
    const templates: Record<string, string> = {
      welcome: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Welcome to LogiQuest!</title></head>
<body style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
  <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:8px; padding:32px;">
    <h1 style="color:#4f46e5;">🧩 Welcome to LogiQuest, {{username}}!</h1>
    <p>We're thrilled to have you join our community of puzzle solvers.</p>
    <p>LogiQuest challenges you with logic puzzles, rewards you with achievements, and lets you climb the global leaderboard.</p>
    <a href="{{{loginUrl}}}" style="display:inline-block; margin-top:16px; padding:12px 24px; background:#4f46e5; color:#fff; text-decoration:none; border-radius:6px;">Start Playing →</a>
    <p style="margin-top:24px; color:#6b7280; font-size:12px;">If you didn't create this account, you can safely ignore this email.</p>
  </div>
</body>
</html>`,

      'password-reset': `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Reset Your Password</title></head>
<body style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
  <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:8px; padding:32px;">
    <h1 style="color:#4f46e5;">🔒 Password Reset</h1>
    <p>Hi {{username}},</p>
    <p>We received a request to reset your password. Click the button below to choose a new one. This link expires in <strong>{{expiresInMinutes}} minutes</strong>.</p>
    <a href="{{{resetUrl}}}" style="display:inline-block; margin-top:16px; padding:12px 24px; background:#4f46e5; color:#fff; text-decoration:none; border-radius:6px;">Reset Password</a>
    <p style="margin-top:24px; color:#6b7280; font-size:12px;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
  </div>
</body>
</html>`,

      'achievement-unlocked': `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Achievement Unlocked!</title></head>
<body style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
  <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:8px; padding:32px;">
    <h1 style="color:#f59e0b;">🏆 Achievement Unlocked!</h1>
    <p>Congratulations, {{username}}!</p>
    <div style="border:2px solid #f59e0b; border-radius:8px; padding:16px; margin:16px 0; text-align:center;">
      {{#if achievementIconUrl}}<img src="{{{achievementIconUrl}}}" alt="Achievement Icon" style="width:64px; height:64px; margin-bottom:8px;">{{/if}}
      <h2 style="color:#f59e0b; margin:0;">{{achievementTitle}}</h2>
      <p style="color:#6b7280; margin:8px 0 0;">{{achievementDescription}}</p>
    </div>
    <a href="{{{profileUrl}}}" style="display:inline-block; margin-top:16px; padding:12px 24px; background:#f59e0b; color:#fff; text-decoration:none; border-radius:6px;">View Your Profile</a>
  </div>
</body>
</html>`,

      'weekly-summary': `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Your Weekly LogiQuest Summary</title></head>
<body style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
  <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:8px; padding:32px;">
    <h1 style="color:#4f46e5;">📊 Your Weekly Summary</h1>
    <p>Hi {{username}}, here's how you did from {{weekStartDate}} to {{weekEndDate}}:</p>
    <div style="background:#f9fafb; border-radius:8px; padding:16px; margin:16px 0;">
      <table style="width:100%; border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0; color:#6b7280;">Puzzles Solved</td>
          <td style="padding:8px 0; text-align:right; font-weight:bold; color:#4f46e5;">{{puzzlesSolved}}</td>
        </tr>
        <tr>
          <td style="padding:8px 0; color:#6b7280;">Total Score</td>
          <td style="padding:8px 0; text-align:right; font-weight:bold; color:#4f46e5;">{{totalScore}}</td>
        </tr>
        <tr>
          <td style="padding:8px 0; color:#6b7280;">Global Rank</td>
          <td style="padding:8px 0; text-align:right; font-weight:bold; color:#4f46e5;">#{{rank}}</td>
        </tr>
        {{#if topAchievement}}
        <tr>
          <td style="padding:8px 0; color:#6b7280;">Top Achievement</td>
          <td style="padding:8px 0; text-align:right; font-weight:bold; color:#f59e0b;">{{topAchievement}}</td>
        </tr>
        {{/if}}
      </table>
    </div>
    <a href="{{{dashboardUrl}}}" style="display:inline-block; margin-top:16px; padding:12px 24px; background:#4f46e5; color:#fff; text-decoration:none; border-radius:6px;">Go to Dashboard</a>
    <p style="margin-top:24px; color:#6b7280; font-size:12px;">
      You're receiving this because you have weekly summaries enabled.
      <a href="{{{dashboardUrl}}}/email-preferences" style="color:#4f46e5;">Manage preferences</a>
    </p>
  </div>
</body>
</html>`,

      test: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>LogiQuest Test Email</title></head>
<body style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
  <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:8px; padding:32px;">
    <h1 style="color:#4f46e5;">✅ Test Email</h1>
    <p>This is a test email from LogiQuest. If you received this, your email configuration is working correctly.</p>
    <p style="color:#6b7280; font-size:12px;">Sent at: {{timestamp}}</p>
  </div>
</body>
</html>`,
    };

    return templates[templateName] ?? `<p>Email: {{message}}</p>`;
  }
}
