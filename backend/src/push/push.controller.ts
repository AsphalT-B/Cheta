import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { PushService } from './push.service.js';
import { PushSubscribeDto, PushUnsubscribeDto } from './push.dto.js';

@Controller('api/v1/push')
export class PushController {
  constructor(private readonly push: PushService) {}
  @Get('public-key') publicKey() { return { public_key: this.push.getPublicKey() }; }
  @Post('subscribe') subscribe(@Session() session: UserSession, @Body() body: PushSubscribeDto) { return this.push.subscribe(session.user.id, body); }
  @Delete('subscribe') unsubscribe(@Session() session: UserSession, @Body() body: PushUnsubscribeDto) { return this.push.unsubscribe(session.user.id, body.endpoint); }
}
