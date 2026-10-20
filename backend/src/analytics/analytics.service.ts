import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { IntervalUnit } from '../subscriptions/subscription.types.js';

const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(userId: string) {
    const subscriptions = await this.subscriptions(userId);
    const today = this.startOfDay(new Date());
    const weekEnd = new Date(today);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + (7 - (weekEnd.getUTCDay() || 7)));
    weekEnd.setUTCHours(23, 59, 59, 999);

    const renewals = subscriptions
      .map((subscription) => this.toSummary(subscription))
      .sort((a, b) => a.next_due_date.localeCompare(b.next_due_date));

    const dueThisWeek = renewals
      .filter((renewal) => {
        const date = this.parseDate(renewal.next_due_date);
        return date >= today && date <= weekEnd;
      })
      .reduce((total, renewal) => total + renewal.price, 0);

    return {
      monthly_spend: this.round(renewals.reduce((total, item) => total + item.monthly_equivalent, 0)),
      active_count: renewals.length,
      due_this_week: this.round(dueThisWeek),
      upcoming_renewals: renewals.slice(0, 5),
    };
  }

  async calendar(userId: string, month: string) {
    const [year, monthNumber] = month.split('-').map(Number);
    const monthStart = new Date(Date.UTC(year, monthNumber - 1, 1));
    const monthEnd = new Date(Date.UTC(year, monthNumber, 0, 23, 59, 59, 999));
    const subscriptions = await this.subscriptions(userId);
    const charges = new Map<string, { date: string; total: number; subscriptions: unknown[] }>();

    for (const subscription of subscriptions) {
      const date = new Date(subscription.startDate);
      while (date <= monthEnd) {
        if (date >= monthStart) {
          const dateKey = this.formatDate(date);
          const existing = charges.get(dateKey) ?? { date: dateKey, total: 0, subscriptions: [] };
          existing.total += Number(subscription.price);
          existing.subscriptions.push({
            id: subscription.id,
            name: subscription.name,
            amount: Number(subscription.price),
            category_id: subscription.categoryId,
          });
          charges.set(dateKey, existing);
        }
        this.advance(date, subscription.intervalCount, subscription.intervalUnit as IntervalUnit);
      }
    }

    const results = [...charges.values()]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((charge) => ({ ...charge, total: this.round(charge.total) }));

    return {
      month,
      charges: results,
      amount_still_due: this.round(results.reduce((total, charge) => total + charge.total, 0)),
    };
  }

  async insights(userId: string, months: number) {
    const subscriptions = await this.subscriptions(userId);
    const summaries = subscriptions.map((subscription) => this.toSummary(subscription));
    const categoryTotals = new Map<string, number>();

    for (const subscription of summaries) {
      categoryTotals.set(
        subscription.category.name,
        (categoryTotals.get(subscription.category.name) ?? 0) + subscription.monthly_equivalent,
      );
    }

    const trend = Array.from({ length: months }, (_, index) => {
      const date = new Date();
      date.setUTCDate(1);
      date.setUTCMonth(date.getUTCMonth() - (months - index - 1));
      return {
        month: `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`,
        monthly_spend: this.round(summaries.reduce((total, item) => total + item.monthly_equivalent, 0)),
      };
    });

    const biggest = [...summaries].sort((a, b) => b.monthly_equivalent - a.monthly_equivalent)[0] ?? null;

    return {
      category_split: [...categoryTotals.entries()].map(([category, total]) => ({
        category,
        monthly_spend: this.round(total),
      })),
      trend,
      biggest_plan: biggest,
      yearly_projection: this.round(summaries.reduce((total, item) => total + item.monthly_equivalent, 0) * 12),
    };
  }

  private subscriptions(userId: string) {
    return this.prisma.subscription.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { startDate: 'asc' },
    });
  }

  private toSummary(subscription: any) {
    const unit = subscription.intervalUnit as IntervalUnit;
    const nextDueDate = this.nextDueDate(subscription.startDate, subscription.intervalCount, unit);
    return {
      id: subscription.id,
      name: subscription.name,
      price: Number(subscription.price),
      category_id: subscription.categoryId,
      category: subscription.category,
      interval_count: subscription.intervalCount,
      interval_unit: unit,
      start_date: this.formatDate(subscription.startDate),
      next_due_date: this.formatDate(nextDueDate),
      monthly_equivalent: this.monthlyEquivalent(Number(subscription.price), subscription.intervalCount, unit),
    };
  }

  private nextDueDate(startDate: Date, count: number, unit: IntervalUnit) {
    const due = new Date(startDate);
    const today = this.startOfDay(new Date());
    while (due < today) this.advance(due, count, unit);
    return due;
  }

  private advance(date: Date, count: number, unit: IntervalUnit) {
    if (unit === 'day') date.setTime(date.getTime() + count * DAY_MS);
    if (unit === 'week') date.setTime(date.getTime() + count * 7 * DAY_MS);
    if (unit === 'month') date.setUTCMonth(date.getUTCMonth() + count);
    if (unit === 'year') date.setUTCFullYear(date.getUTCFullYear() + count);
  }

  private monthlyEquivalent(price: number, count: number, unit: IntervalUnit) {
    if (unit === 'day') return this.round((price / count) * 30.4375);
    if (unit === 'week') return this.round((price / count) * 52 / 12);
    if (unit === 'year') return this.round(price / count / 12);
    return this.round(price / count);
  }

  private startOfDay(date: Date) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  }

  private parseDate(value: string) {
    return new Date(`${value}T00:00:00.000Z`);
  }

  private formatDate(value: Date) {
    return value.toISOString().slice(0, 10);
  }

  private round(value: number) {
    return Number(value.toFixed(2));
  }
}
