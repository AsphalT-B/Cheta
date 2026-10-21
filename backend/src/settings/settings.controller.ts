import { Body, Controller, Get, Patch } from '@nestjs/common';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { SettingsService } from './settings.service.js';
import { UpdateSettingsDto } from './settings.dto.js';

@Controller('api/v1/settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  get(@Session() session: UserSession) {
    return this.settings.get(session.user.id);
  }

  @Patch()
  update(@Session() session: UserSession, @Body() body: UpdateSettingsDto) {
    return this.settings.update(session.user.id, body);
  }
}
