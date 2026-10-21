import { IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional() @IsInt() @Min(0) @Max(30) renewal_alert_days?: number;
  @IsOptional() @IsArray() @IsInt({ each: true }) @Min(0, { each: true }) @Max(30, { each: true }) renewal_reminder_days?: number[];
  @IsOptional() @IsBoolean() in_app_notifications_enabled?: boolean;
  @IsOptional() @IsBoolean() email_notifications_enabled?: boolean;
  @IsOptional() @IsBoolean() weekly_summary_enabled?: boolean;
  @IsOptional() @IsIn(['light', 'dark', 'system']) theme?: 'light' | 'dark' | 'system';
  @IsOptional() @IsString() timezone?: string;
}
