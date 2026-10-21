import { IsDateString, IsIn, IsInt, IsNumber, IsOptional, IsString, IsUUID, Min, MinLength } from 'class-validator';

export class SubscriptionDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  logo_url?: string | null;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @IsUUID()
  category_id!: string;

  @IsInt()
  @Min(1)
  interval_count!: number;

  @IsIn(['day', 'week', 'month', 'year'])
  interval_unit!: 'day' | 'week' | 'month' | 'year';

  @IsDateString()
  start_date!: string;
}

export class UpdateSubscriptionDto {
  @IsOptional() @IsString() @MinLength(1) name?: string;
  @IsOptional() @IsString() logo_url?: string | null;
  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) price?: number;
  @IsOptional() @IsUUID() category_id?: string;
  @IsOptional() @IsInt() @Min(1) interval_count?: number;
  @IsOptional() @IsIn(['day', 'week', 'month', 'year']) interval_unit?: 'day' | 'week' | 'month' | 'year';
  @IsOptional() @IsDateString() start_date?: string;
}
