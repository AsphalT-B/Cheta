export type Subscription = { id: string | number; name: string; category: string; categoryId?: string; price: number; billingDay: number; workspace: string; color: string; period: string; intervalCount?: number; intervalUnit?: "day" | "week" | "month" | "year"; startDate?: string; logoUrl?: string; nextDueDate?: string; monthlyEquivalent?: number };

export function formatSubscriptionDate(value?: string) {
  if (!value) return "Upcoming";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-NG", { month: "short", day: "numeric" });
}

export function subscriptionDueLabel(value?: string) {
  if (!value) return "Upcoming";
  const due = new Date(`${value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.ceil((due.getTime() - today.getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `in ${days} days`;
}
