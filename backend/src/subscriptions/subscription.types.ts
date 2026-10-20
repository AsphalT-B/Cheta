export type IntervalUnit = 'day' | 'week' | 'month' | 'year';

export type SubscriptionResponse = {
  id: string;
  name: string;
  price: number;
  category_id: string;
  category: { id: string; name: string };
  interval_count: number;
  interval_unit: IntervalUnit;
  start_date: string;
  next_due_date: string;
  monthly_equivalent: number;
};
