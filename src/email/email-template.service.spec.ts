import { EmailTemplateService } from './email-template.service';

describe('EmailTemplateService', () => {
  let service: EmailTemplateService;

  beforeEach(() => {
    service = new EmailTemplateService();
    service.clearCache(); // ensure a clean cache for every test
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('compile – welcome template', () => {
    it('should render the username into the welcome email', () => {
      const html = service.compile('welcome', {
        username: 'Alice',
        loginUrl: 'https://logiquest.app/login',
      });
      expect(html).toContain('Alice');
      expect(html).toContain('https://logiquest.app/login');
    });
  });

  describe('compile – password-reset template', () => {
    it('should render reset URL and expiry time', () => {
      const html = service.compile('password-reset', {
        username: 'Bob',
        resetUrl: 'https://logiquest.app/reset?token=abc',
        expiresInMinutes: 30,
      });
      expect(html).toContain('Bob');
      expect(html).toContain('https://logiquest.app/reset?token=abc');
      expect(html).toContain('30');
    });
  });

  describe('compile – achievement-unlocked template', () => {
    it('should render achievement title and description', () => {
      const html = service.compile('achievement-unlocked', {
        username: 'Carol',
        achievementTitle: 'First Blood',
        achievementDescription: 'Solved your first puzzle!',
        profileUrl: 'https://logiquest.app/profile',
      });
      expect(html).toContain('Carol');
      expect(html).toContain('First Blood');
      expect(html).toContain('Solved your first puzzle!');
    });

    it('should omit icon img tag when achievementIconUrl is not provided', () => {
      const html = service.compile('achievement-unlocked', {
        username: 'Carol',
        achievementTitle: 'First Blood',
        achievementDescription: 'Desc',
        profileUrl: 'https://logiquest.app/profile',
      });
      expect(html).not.toContain('<img');
    });

    it('should render icon img tag when achievementIconUrl is provided', () => {
      const html = service.compile('achievement-unlocked', {
        username: 'Carol',
        achievementTitle: 'First Blood',
        achievementDescription: 'Desc',
        achievementIconUrl: 'https://cdn.logiquest.app/icons/first-blood.png',
        profileUrl: 'https://logiquest.app/profile',
      });
      expect(html).toContain('<img');
      expect(html).toContain('https://cdn.logiquest.app/icons/first-blood.png');
    });
  });

  describe('compile – weekly-summary template', () => {
    it('should render all stats', () => {
      const html = service.compile('weekly-summary', {
        username: 'Dave',
        weekStartDate: '2026-07-07',
        weekEndDate: '2026-07-13',
        puzzlesSolved: 12,
        totalScore: 4500,
        rank: 3,
        dashboardUrl: 'https://logiquest.app/dashboard',
      });
      expect(html).toContain('Dave');
      expect(html).toContain('12');
      expect(html).toContain('4500');
      expect(html).toContain('#3');
    });

    it('should render topAchievement row when provided', () => {
      const html = service.compile('weekly-summary', {
        username: 'Dave',
        weekStartDate: '2026-07-07',
        weekEndDate: '2026-07-13',
        puzzlesSolved: 12,
        totalScore: 4500,
        rank: 3,
        topAchievement: 'Speed Demon',
        dashboardUrl: 'https://logiquest.app/dashboard',
      });
      expect(html).toContain('Speed Demon');
    });

    it('should omit topAchievement row when not provided', () => {
      const html = service.compile('weekly-summary', {
        username: 'Dave',
        weekStartDate: '2026-07-07',
        weekEndDate: '2026-07-13',
        puzzlesSolved: 12,
        totalScore: 4500,
        rank: 3,
        dashboardUrl: 'https://logiquest.app/dashboard',
      });
      expect(html).not.toContain('Top Achievement');
    });
  });

  describe('compile – test template', () => {
    it('should include the timestamp in the test email', () => {
      const ts = '2026-07-16T00:00:00.000Z';
      const html = service.compile('test', { timestamp: ts });
      expect(html).toContain(ts);
    });
  });

  describe('template caching', () => {
    it('should cache compiled templates and return the same output on second call', () => {
      const ctx = { username: 'Eve', loginUrl: 'https://logiquest.app' };
      const first = service.compile('welcome', ctx);
      const second = service.compile('welcome', ctx);
      expect(first).toBe(second);
    });

    it('clearCache() should force re-compilation', () => {
      const ctx = { username: 'Eve', loginUrl: 'https://logiquest.app' };
      service.compile('welcome', ctx);
      service.clearCache();
      // After clearing the cache map, a new Handlebars compilation is triggered.
      // The output should still be functionally identical.
      const html = service.compile('welcome', ctx);
      expect(html).toContain('Eve');
    });
  });
});
