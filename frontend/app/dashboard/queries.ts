"use client";

import { useQuery } from "@tanstack/react-query";
import { DashboardData } from "./data";

async function getDashboard(): Promise<DashboardData> {
  const response = await fetch("/api/dashboard", { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load dashboard data");
  return response.json();
}

export function useDashboardQuery() {
  return useQuery({ queryKey: ["dashboard"], queryFn: getDashboard, refetchInterval: 30_000, refetchIntervalInBackground: true });
}

export function useSubscriptionsQuery() {
  const query = useDashboardQuery();
  return { ...query, data: query.data?.subscriptions ?? [] };
}
