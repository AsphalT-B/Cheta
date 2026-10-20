import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

const DEFAULT_SETTINGS = {
  renewalAlertDays: 3,
  weeklySummaryEnabled: false,
  theme: 'system' as const,
  timezone: 'UTC',
};

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  get(userId: string) {
    return this.prisma.userSettings.upsert({
      where: { userId },
      update: {},
      create: { userId, ...DEFAULT_SETTINGS },
      select: {
        renewalAlertDays: true,
        weeklySummaryEnabled: true,
        theme: true,
        timezone: true,
      },
    }).then((settings) => this.toResponse(settings));
  }

  async update(userId: string, input: {
    renewal_alert_days?: number;
    weekly_summary_enabled?: boolean;
    theme?: 'light' | 'dark' | 'system';
    timezone?: string;
  }) {
    if (input.renewal_alert_days !== undefined &&
      (!Number.isInteger(input.renewal_alert_days) || input.renewal_alert_days < 0 || input.renewal_alert_days > 30)) {
      throw new BadRequestException('renewal_alert_days must be an integer between 0 and 30');
    }

    if (input.timezone !== undefined) {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: input.timezone }).format();
      } catch {
        throw new BadRequestException('timezone must be a valid IANA timezone');
      }
    }

    const settings = await this.prisma.userSettings.upsert({
      where: { userId },
      update: {
        ...(input.renewal_alert_days === undefined ? {} : { renewalAlertDays: input.renewal_alert_days }),
        ...(input.weekly_summary_enabled === undefined ? {} : { weeklySummaryEnabled: input.weekly_summary_enabled }),
        ...(input.theme === undefined ? {} : { theme: input.theme }),
        ...(input.timezone === undefined ? {} : { timezone: input.timezone }),
      },
      create: {
        userId,
        renewalAlertDays: input.renewal_alert_days ?? DEFAULT_SETTINGS.renewalAlertDays,
        weeklySummaryEnabled: input.weekly_summary_enabled ?? DEFAULT_SETTINGS.weeklySummaryEnabled,
        theme: input.theme ?? DEFAULT_SETTINGS.theme,
        timezone: input.timezone ?? DEFAULT_SETTINGS.timezone,
      },
      select: {
        renewalAlertDays: true,
        weeklySummaryEnabled: true,
        theme: true,
        timezone: true,
      },
    });

    return this.toResponse(settings);
  }

  private toResponse(settings: {
    renewalAlertDays: number;
    weeklySummaryEnabled: boolean;
    theme: string;
    timezone: string;
  }) {
    return {
      renewal_alert_days: settings.renewalAlertDays,
      weekly_summary_enabled: settings.weeklySummaryEnabled,
      theme: settings.theme,
      timezone: settings.timezone,
    };
  }
}
