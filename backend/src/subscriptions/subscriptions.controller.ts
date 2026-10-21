import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { SubscriptionsService } from './subscriptions.service.js';
import { SubscriptionDto, UpdateSubscriptionDto } from './subscription.dto.js';

@Controller('api/v1/subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptions: SubscriptionsService) {}

  @Get()
  list(@Session() session: UserSession, @Query('q') q?: string, @Query('category_id') categoryId?: string) {
    return this.subscriptions.list(session.user.id, q, categoryId);
  }

  @Get(':id')
  findOne(@Session() session: UserSession, @Param('id') id: string) {
    return this.subscriptions.findOne(session.user.id, id);
  }

  @Post()
  create(@Session() session: UserSession, @Body() body: SubscriptionDto) {
    return this.subscriptions.create(session.user.id, body);
  }

  @Patch(':id')
  update(@Session() session: UserSession, @Param('id') id: string, @Body() body: UpdateSubscriptionDto) {
    return this.subscriptions.update(session.user.id, id, body);
  }

  @Delete(':id')
  async remove(@Session() session: UserSession, @Param('id') id: string) {
    await this.subscriptions.remove(session.user.id, id);
  }
}
