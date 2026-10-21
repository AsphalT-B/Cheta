import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service.js';
import { sendRenewalReminderEmail } from '../auth/email.service.js';
import { PushService } from '../push/push.service.js';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService, private readonly push: PushService) {}

  list(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId, inApp: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }).then((items) => ({ items, unread_count: items.filter((item) => !item.read).length }));
  }

  async markRead(userId: string, id: string) {
    const notification = await this.prisma.notification.findFirst({ where: { id, userId } });
    if (!notification) throw new NotFoundException('Notification not found');
    return this.prisma.notification.update({ where: { id }, data: { read: true } });
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
    return { success: true };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async createRenewalNotifications() {
    const users = await this.prisma.user.findMany({
      include: { settings: true, subscriptions: { include: { category: true } } },
    });
    for (const user of users) {
      const settings = user.settings;
      const reminderDays = settings?.renewalReminderDays?.length ? settings.renewalReminderDays : [7, 3, 1, 0];
      const today = this.startOfDayInTimezone(new Date(), settings?.timezone ?? 'UTC');
      for (const subscription of user.subscriptions) {
        const dueDate = this.nextDueDate(subscription.startDate, subscription.intervalCount, subscription.intervalUnit);
        const daysUntilDue = Math.round((dueDate.getTime() - today.getTime()) / 86_400_000);
        if (!reminderDays.includes(daysUntilDue)) continue;
        const dueLabel = dueDate.toISOString().slice(0, 10);
        const dedupeKey = `renewal:${subscription.id}:${dueLabel}:${daysUntilDue}`;
        if (!settings?.inAppNotificationsEnabled && !settings?.emailNotificationsEnabled) continue;
        const message = daysUntilDue === 0 ? `${subscription.name} renews today.` : `${subscription.name} renews in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}.`;
        const existing = await this.prisma.notification.upsert({
          where: { dedupeKey },
          create: { userId: user.id, type: 'renewal', title: `${subscription.name} renews soon`, message, dedupeKey, inApp: settings?.inAppNotificationsEnabled ?? true },
          update: { inApp: settings?.inAppNotificationsEnabled ?? true },
        });
        if (settings?.emailNotificationsEnabled && !existing.emailSentAt) {
          try {
            await sendRenewalReminderEmail({ to: user.email, name: user.name, subscription: subscription.name, daysUntilDue, dueDate: dueLabel });
            await this.prisma.notification.update({ where: { id: existing.id }, data: { emailSentAt: new Date() } });
          } catch (error) {
            console.error(`Renewal email failed for ${subscription.name}:`, error);
          }
        }
        await this.push.send(user.id, { title: `${subscription.name} renews soon`, message, url: '/dashboard/notifications' });
      }
    }
  }

  private nextDueDate(startDate: Date, count: number, unit: string) {
    const due = new Date(startDate);
    const today = this.startOfDay(new Date());
    while (due < today) {
      if (unit === 'day') due.setUTCDate(due.getUTCDate() + count);
      if (unit === 'week') due.setUTCDate(due.getUTCDate() + count * 7);
      if (unit === 'month') due.setUTCMonth(due.getUTCMonth() + count);
      if (unit === 'year') due.setUTCFullYear(due.getUTCFullYear() + count);
    }
    return due;
  }

  private startOfDay(date: Date) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  }

  private startOfDayInTimezone(date: Date, timezone: string) {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return new Date(`${values.year}-${values.month}-${values.day}T00:00:00.000Z`);
  }
}
