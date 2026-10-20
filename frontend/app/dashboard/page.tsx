"use client";

import { AddSubscriptionButton, DashboardHeader, ErrorState, LoadingState, Money, SubscriptionLogo } from "./components";
import type { Subscription } from "./data";
import { useDashboardQuery } from "./queries";
import Link from "next/link";

function nextRenewal(item: Subscription) {
  const today = new Date();
  let date = new Date(today.getFullYear(), today.getMonth(), item.billingDay);
  date.setHours(0, 0, 0, 0);
  if (date < new Date(today.getFullYear(), today.getMonth(), today.getDate())) date = new Date(today.getFullYear(), today.getMonth() + 1, item.billingDay);
  return date;
}

function renewalLabel(date: Date) { return date.toLocaleDateString("en-NG", { month: "short", day: "numeric" }); }

export default function OverviewPage() { const { data, isLoading, isError } = useDashboardQuery(); const subscriptions = data?.subscriptions ?? []; const monthly = subscriptions.reduce((sum, item) => sum + (item.period === "yearly" ? item.price / 12 : item.price), 0); if (isLoading) return <LoadingState />; if (isError || !data) return <ErrorState />; const upcoming = subscriptions.map(item => ({ item, date: nextRenewal(item) })).sort((a, b) => a.date.getTime() - b.date.getTime()); return <><DashboardHeader title={`Good afternoon, ${data.user.name.split(" ")[0]}.`} subtitle="Everything you pay for, organized in one secure place." action={<AddSubscriptionButton />} /><div className="dashboard-stats"><article className="stat-card hot"><small>Monthly spend</small><strong><Money value={monthly} /></strong><span>8% lower than last month</span></article><article className="stat-card"><small>Active subscriptions</small><strong>{subscriptions.length}</strong><span>{upcoming[0]?.item.name} renews soon</span></article><article className="stat-card"><small>Due this week</small><strong><Money value={subscriptions.filter(item => item.billingDay <= 7).reduce((sum, item) => sum + item.price, 0)} /></strong><span>{subscriptions.filter(item => item.billingDay <= 7).length} renewals in the next 7 days</span></article></div><section className="dashboard-panel upcoming-card"><div className="panel-heading"><div><h2>Upcoming subscriptions</h2><small>Your next scheduled renewals</small></div><Link href="/dashboard/calendar">View calendar</Link></div>{upcoming.slice(0, 4).map(({ item, date }) => <div className="upcoming-row" key={item.id}><SubscriptionLogo item={item} /><div><b>{item.name}</b><small>{item.category}</small></div><div className="upcoming-date"><b>{renewalLabel(date)}</b><small>{date.getTime() === new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime() ? "Today" : "Upcoming"}</small></div><strong><Money value={item.price} /></strong></div>)}</section><section className="dashboard-panel"><div className="panel-heading"><div><h2>Your subscriptions</h2><small>Track every plan and renewal</small></div><Link href="/dashboard/subscriptions">View all</Link></div>{upcoming.slice(0, 5).map(({ item }) => <SubscriptionRow key={item.id} item={item} />)}</section></>; }

function SubscriptionRow({ item }: { item: Subscription }) { return <div className="subscription-row"><SubscriptionLogo item={item} /><div><b>{item.name}</b><small>{item.category}</small></div><div className="row-price"><b><Money value={item.price} /></b><small>per {item.period === "yearly" ? "year" : "month"}</small></div><div className="renewal"><b>May {item.billingDay}</b><small className={item.billingDay <= 3 ? "soon" : ""}>{item.billingDay <= 3 ? "Soon" : `in ${item.billingDay} days`}</small></div></div>; }
