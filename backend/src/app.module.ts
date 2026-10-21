import { Module } from '@nestjs/common';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AnalyticsModule } from './analytics/analytics.module.js';
import { auth } from './auth/auth.js';
import { CategoriesModule } from './categories/categories.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { SubscriptionsModule } from './subscriptions/subscriptions.module.js';
import { SettingsModule } from './settings/settings.module.js';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsModule } from './notifications/notifications.module.js';
import { PushModule } from './push/push.module.js';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, AuthModule.forRoot({ auth }), CategoriesModule, SubscriptionsModule, AnalyticsModule, SettingsModule, NotificationsModule, PushModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
