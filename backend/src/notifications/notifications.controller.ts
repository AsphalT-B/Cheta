import { Controller, Get, Param, Patch } from '@nestjs/common';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { NotificationsService } from './notifications.service.js';

@Controller('api/v1/notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  list(@Session() session: UserSession) {
    return this.notifications.list(session.user.id);
  }

  @Patch('read-all')
  markAllRead(@Session() session: UserSession) {
    return this.notifications.markAllRead(session.user.id);
  }

  @Patch(':id/read')
  markRead(@Session() session: UserSession, @Param('id') id: string) {
    return this.notifications.markRead(session.user.id, id);
  }
}
