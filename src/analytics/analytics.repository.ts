/* eslint-disable prettier/prettier */
import { EntityRepository, Repository } from 'typeorm';
import { AnalyticsEvent } from './entities/analytics-event.entity';

@EntityRepository(AnalyticsEvent)
export class AnalyticsEventRepository extends Repository<AnalyticsEvent> {
  async findRecentEvents(limit = 100) {
    return this.createQueryBuilder('event')
      .orderBy('event.createdAt', 'DESC')
      .limit(limit)
      .getMany();
  }

  async countEventsByType(eventType: string) {
    return this.createQueryBuilder('event')
      .where('event.eventType = :eventType', { eventType })
      .getCount();
  }

  async findEventsByUser(userId: string) {
    return this.createQueryBuilder('event')
      .where('event.userId = :userId', { userId })
      .orderBy('event.createdAt', 'DESC')
      .getMany();
  }

  async aggregateEventsByDay() {
    return this.query(`
      SELECT
        DATE_TRUNC('day', "createdAt") AS day,
        COUNT(*) as total
      FROM analytics_events
      GROUP BY day
      ORDER BY day DESC
      LIMIT 30
    `);
  }
}
