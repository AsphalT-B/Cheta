import { Injectable } from '@nestjs/common';
import webpush from 'web-push';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PushService {
  constructor(private readonly prisma: PrismaService) {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT;
    if (publicKey && privateKey && subject) webpush.setVapidDetails(subject, publicKey, privateKey);
  }

  getPublicKey() { return process.env.VAPID_PUBLIC_KEY ?? null; }

  async subscribe(userId: string, input: { endpoint: string; keys: { p256dh: string; auth: string } }) {
    return this.prisma.pushSubscription.upsert({
      where: { endpoint: input.endpoint },
      update: { userId, p256dh: input.keys.p256dh, auth: input.keys.auth },
      create: { userId, endpoint: input.endpoint, p256dh: input.keys.p256dh, auth: input.keys.auth },
    });
  }

  async unsubscribe(userId: string, endpoint: string) {
    await this.prisma.pushSubscription.deleteMany({ where: { userId, endpoint } });
    return { success: true };
  }

  async send(userId: string, payload: { title: string; message: string; url: string }) {
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY || !process.env.VAPID_SUBJECT) return;
    const subscriptions = await this.prisma.pushSubscription.findMany({ where: { userId } });
    await Promise.all(subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification({ endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } }, JSON.stringify(payload));
      } catch (error: any) {
        if (error?.statusCode === 404 || error?.statusCode === 410) await this.prisma.pushSubscription.delete({ where: { id: subscription.id } });
      }
    }));
  }
}
