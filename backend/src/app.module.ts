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

@Module({
  imports: [PrismaModule, AuthModule.forRoot({ auth }), CategoriesModule, SubscriptionsModule, AnalyticsModule, SettingsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
