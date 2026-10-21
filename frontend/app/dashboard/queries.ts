"use client";

import { useQuery } from "@tanstack/react-query";
import { apiBaseUrl, authClient } from "../lib/auth-client";
import type { Subscription } from "./data";

export type Category = { id: string; name: string };

export type DashboardOverview = {
  monthly_spend: number;
  active_count: number;
  due_this_week: number;
  upcoming_renewals: Array<{
    id: string;
    name: string;
    logo_url: string | null;
    price: number;
    category: { id: string; name: string };
    interval_count: number;
    interval_unit: "day" | "week" | "month" | "year";
    start_date: string;
    next_due_date: string;
    monthly_equivalent: number;
  }>;
};

async function getOverview(): Promise<DashboardOverview> {
  const response = await fetch(`${apiBaseUrl}/api/v1/dashboard/overview`, { credentials: "include", cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load dashboard overview");
  return response.json();
}

export function useDashboardOverviewQuery() {
  return useQuery({ queryKey: ["dashboard-overview"], queryFn: getOverview, refetchInterval: 30_000, refetchIntervalInBackground: true });
}

export type CalendarCharge = { date: string; total: number; subscriptions: Array<{ id: string; name: string; amount: number; category_id: string }> };
export type CalendarData = { month: string; charges: CalendarCharge[]; amount_still_due: number };

async function getCalendar(month: string): Promise<CalendarData> {
  const response = await fetch(`${apiBaseUrl}/api/v1/calendar?month=${month}`, { credentials: "include", cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load calendar");
  return response.json();
}

export function useCalendarQuery(month: string) {
  return useQuery({ queryKey: ["calendar", month], queryFn: () => getCalendar(month), refetchInterval: 30_000 });
}

export type InsightsData = {
  category_split: Array<{ category: string; monthly_spend: number }>;
  trend: Array<{ month: string; monthly_spend: number }>;
  biggest_plan: { name: string; price: number; monthly_equivalent: number } | null;
  yearly_projection: number;
};

async function getInsights(): Promise<InsightsData> {
  const response = await fetch(`${apiBaseUrl}/api/v1/insights?months=6`, { credentials: "include", cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load insights");
  return response.json();
}

export function useInsightsQuery() {
  return useQuery({ queryKey: ["insights"], queryFn: getInsights, refetchInterval: 30_000 });
}

export type SettingsData = { renewal_alert_days: number; renewal_reminder_days: number[]; in_app_notifications_enabled: boolean; email_notifications_enabled: boolean; weekly_summary_enabled: boolean; theme: "light" | "dark" | "system"; timezone: string };

async function getSettings(): Promise<SettingsData> {
  const response = await fetch(`${apiBaseUrl}/api/v1/settings`, { credentials: "include", cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load settings");
  return response.json();
}

export function useSettingsQuery() {
  return useQuery({ queryKey: ["settings"], queryFn: getSettings, staleTime: 60_000 });
}

export async function updateSettings(input: Partial<SettingsData>) {
  const response = await fetch(`${apiBaseUrl}/api/v1/settings`, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
  if (!response.ok) { const result = await response.json().catch(() => null); throw new Error(result?.message ?? "Unable to save settings"); }
  return response.json() as Promise<SettingsData>;
}

export type NotificationItem = { id: string; type: "renewal" | "weekly_summary"; title: string; message: string; read: boolean; createdAt: string };
export type NotificationsData = { items: NotificationItem[]; unread_count: number };

async function getNotifications(): Promise<NotificationsData> {
  const response = await fetch(`${apiBaseUrl}/api/v1/notifications`, { credentials: "include", cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load notifications");
  return response.json();
}

export function useNotificationsQuery() {
  return useQuery({ queryKey: ["notifications"], queryFn: getNotifications, refetchInterval: 60_000 });
}

export async function markNotificationRead(id: string) {
  const response = await fetch(`${apiBaseUrl}/api/v1/notifications/${id}/read`, { method: "PATCH", credentials: "include" });
  if (!response.ok) throw new Error("Unable to mark notification as read");
}

export async function markAllNotificationsRead() {
  const response = await fetch(`${apiBaseUrl}/api/v1/notifications/read-all`, { method: "PATCH", credentials: "include" });
  if (!response.ok) throw new Error("Unable to mark notifications as read");
}

function categoryColor(name: string) {
  const colors: Record<string, string> = { Entertainment: "#17171a", Productivity: "#5e6ad2", "Cloud Storage": "#2f80ed", Health: "#22a06b", Education: "#7a4dff", Other: "#4a4a52" };
  return colors[name] ?? "#4a4a52";
}

function suggestedLogoUrl(name: string) {
  const aliases: Record<string, string> = { "icloud+": "icloud", "adobe cc": "adobecreativecloud", "cloud storage": "icloud" };
  const normalized = name.trim().toLowerCase();
  const slug = aliases[normalized] ?? normalized.replace(/\+/g, "").replace(/[^a-z0-9]/g, "");
  return slug ? `https://cdn.simpleicons.org/${slug}/FFFFFF` : undefined;
}

function mapSubscription(item: any): Subscription {
  return { id: item.id, name: item.name, logoUrl: item.logo_url ?? suggestedLogoUrl(item.name), category: item.category.name, categoryId: item.category_id, price: item.price, billingDay: Number(item.next_due_date.slice(-2)), workspace: "Personal", color: categoryColor(item.category.name), period: item.interval_unit === "year" ? "yearly" : item.interval_unit, intervalCount: item.interval_count, intervalUnit: item.interval_unit, startDate: item.start_date, nextDueDate: item.next_due_date, monthlyEquivalent: item.monthly_equivalent };
}

async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${apiBaseUrl}/api/v1/categories`, { credentials: "include", cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load categories");
  return response.json();
}

async function getSubscriptions(search = ""): Promise<Subscription[]> {
  const query = search.trim() ? `?q=${encodeURIComponent(search.trim())}` : "";
  const response = await fetch(`${apiBaseUrl}/api/v1/subscriptions${query}`, { credentials: "include", cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load subscriptions");
  const result = await response.json();
  return result.items.map(mapSubscription);
}

export function useCategoriesQuery() {
  return useQuery({ queryKey: ["categories"], queryFn: getCategories, staleTime: 300_000 });
}

export function useSubscriptionsQuery(search = "") {
  const query = useQuery({ queryKey: ["subscriptions", search], queryFn: () => getSubscriptions(search), refetchInterval: 30_000, refetchIntervalInBackground: true });
  return { ...query, data: query.data ?? [] };
}

export type SubscriptionInput = { name: string; logo_url?: string | null; price: number; category_id: string; interval_count: number; interval_unit: "day" | "week" | "month" | "year"; start_date: string };

async function subscriptionRequest(path: string, method: "POST" | "PATCH" | "DELETE", body?: SubscriptionInput) {
  const response = await fetch(`${apiBaseUrl}/api/v1/subscriptions${path}`, { method, credentials: "include", headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
  if (!response.ok) { const result = await response.json().catch(() => null); throw new Error(result?.message ?? "Subscription request failed"); }
  return method === "DELETE" ? undefined : mapSubscription(await response.json());
}

export function createSubscription(input: SubscriptionInput) { return subscriptionRequest("", "POST", input); }
export function updateSubscription(id: string | number, input: SubscriptionInput) { return subscriptionRequest(`/${id}`, "PATCH", input); }
export function deleteSubscription(id: string | number) { return subscriptionRequest(`/${id}`, "DELETE"); }
