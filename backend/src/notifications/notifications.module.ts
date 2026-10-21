import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller.js';
import { NotificationsService } from './notifications.service.js';
import { PushModule } from '../push/push.module.js';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService],
  imports: [PushModule],
  exports: [NotificationsService],
})
export class NotificationsModule {}
