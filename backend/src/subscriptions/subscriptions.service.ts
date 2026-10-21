import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { SubscriptionResponse, IntervalUnit } from './subscription.types.js';

const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, q?: string, categoryId?: string) {
    const search = q?.trim().slice(0, 80);
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        userId,
        ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
        ...(categoryId ? { categoryId } : {}),
      },
      include: { category: true },
      orderBy: { startDate: 'asc' },
      take: 100,
    });

    return {
      items: subscriptions.map((subscription) => this.toResponse(subscription)),
      total: subscriptions.length,
    };
  }

  async findOne(userId: string, id: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { id, userId },
      include: { category: true },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return this.toResponse(subscription);
  }

  async create(userId: string, input: {
    name: string;
    logo_url?: string | null;
    price: number;
    category_id: string;
    interval_count: number;
    interval_unit: IntervalUnit;
    start_date: string;
  }) {
    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        categoryId: input.category_id,
        name: input.name,
        logoUrl: input.logo_url ?? null,
        price: input.price,
        intervalCount: input.interval_count,
        intervalUnit: input.interval_unit,
        startDate: this.parseDate(input.start_date),
      },
      include: { category: true },
    });

    return this.toResponse(subscription);
  }

  async update(userId: string, id: string, input: Partial<{
    name: string;
    logo_url?: string | null;
    price: number;
    category_id: string;
    interval_count: number;
    interval_unit: IntervalUnit;
    start_date: string;
  }>) {
    await this.findOne(userId, id);

    const subscription = await this.prisma.subscription.update({
      where: { id },
      data: {
        ...(input.name === undefined ? {} : { name: input.name }),
        ...(input.logo_url === undefined ? {} : { logoUrl: input.logo_url }),
        ...(input.price === undefined ? {} : { price: input.price }),
        ...(input.category_id === undefined ? {} : { categoryId: input.category_id }),
        ...(input.interval_count === undefined ? {} : { intervalCount: input.interval_count }),
        ...(input.interval_unit === undefined ? {} : { intervalUnit: input.interval_unit }),
        ...(input.start_date === undefined ? {} : { startDate: this.parseDate(input.start_date) }),
      },
      include: { category: true },
    });

    return this.toResponse(subscription);
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.subscription.delete({ where: { id } });
  }

  private toResponse(subscription: any): SubscriptionResponse {
    const intervalUnit = subscription.intervalUnit as IntervalUnit;
    return {
      id: subscription.id,
      name: subscription.name,
      logo_url: subscription.logoUrl,
      price: Number(subscription.price),
      category_id: subscription.categoryId,
      category: subscription.category,
      interval_count: subscription.intervalCount,
      interval_unit: intervalUnit,
      start_date: this.formatDate(subscription.startDate),
      next_due_date: this.formatDate(this.nextDueDate(subscription.startDate, subscription.intervalCount, intervalUnit)),
      monthly_equivalent: this.monthlyEquivalent(Number(subscription.price), subscription.intervalCount, intervalUnit),
    };
  }

  private nextDueDate(startDate: Date, count: number, unit: IntervalUnit) {
    const due = new Date(startDate);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    while (due <= today) {
      this.advance(due, count, unit);
    }

    return due;
  }

  private advance(date: Date, count: number, unit: IntervalUnit) {
    if (unit === 'day') date.setTime(date.getTime() + count * DAY_MS);
    if (unit === 'week') date.setTime(date.getTime() + count * 7 * DAY_MS);
    if (unit === 'month') date.setUTCMonth(date.getUTCMonth() + count);
    if (unit === 'year') date.setUTCFullYear(date.getUTCFullYear() + count);
  }

  private monthlyEquivalent(price: number, count: number, unit: IntervalUnit) {
    if (unit === 'day') return Number(((price / count) * 30.4375).toFixed(2));
    if (unit === 'week') return Number(((price / count) * 52 / 12).toFixed(2));
    if (unit === 'year') return Number((price / count / 12).toFixed(2));
    return Number((price / count).toFixed(2));
  }

  private parseDate(value: string) {
    const date = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) throw new Error('Invalid date');
    return date;
  }

  private formatDate(value: Date) {
    return value.toISOString().slice(0, 10);
  }
}
