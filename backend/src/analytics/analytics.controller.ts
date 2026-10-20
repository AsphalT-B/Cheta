import { Controller, Get, Query } from '@nestjs/common';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { AnalyticsService } from './analytics.service.js';

@Controller('api/v1')
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get('dashboard/overview')
  overview(@Session() session: UserSession) {
    return this.analytics.overview(session.user.id);
  }

  @Get('calendar')
  calendar(@Session() session: UserSession, @Query('month') month?: string) {
    return this.analytics.calendar(session.user.id, month ?? this.currentMonth());
  }

  @Get('insights')
  insights(@Session() session: UserSession, @Query('months') months?: string) {
    const count = Math.min(Math.max(Number(months ?? 6) || 6, 1), 24);
    return this.analytics.insights(session.user.id, count);
  }

  private currentMonth() {
    const date = new Date();
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
  }
}
