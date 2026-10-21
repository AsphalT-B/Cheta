"use client";

import Link from "next/link";
import { AddSubscriptionButton, DashboardHeader, ErrorState, LoadingState, Money, SubscriptionLogo } from "./components";
import { formatSubscriptionDate, subscriptionDueLabel, type Subscription } from "./data";
import { useDashboardOverviewQuery } from "./queries";
import { authClient } from "../lib/auth-client";

function renewalLabel(date: Date) { return date.toLocaleDateString("en-NG", { month: "short", day: "numeric" }); }

export default function OverviewClient() {
  const { data, isLoading, isError } = useDashboardOverviewQuery();
  const session = authClient.useSession();
  if (isLoading || session.isPending) return <LoadingState />;
  if (isError || !data) return <ErrorState />;
  const userName = session.data?.user.name ?? "there";
  const subscriptions = data.upcoming_renewals.map(item => ({ id: item.id, name: item.name, logoUrl: item.logo_url ?? undefined, category: item.category.name, price: item.price, billingDay: Number(item.next_due_date.slice(-2)), workspace: "Personal", color: "#4a4a52", period: item.interval_unit === "year" ? "yearly" : "monthly", nextDueDate: item.next_due_date }));
  const upcoming = subscriptions.map(item => ({ item, date: new Date(`${item.nextDueDate}T00:00:00`) })).sort((a, b) => a.date.getTime() - b.date.getTime());
  return <>
    <DashboardHeader title={`Good afternoon, ${userName.split(" ")[0]}.`} subtitle="Everything you pay for, organized in one secure place." action={<AddSubscriptionButton />} />
    <div className="dashboard-stats"><article className="stat-card hot"><small>Monthly spend</small><strong><Money value={data.monthly_spend} /></strong><span>Live from your subscription vault</span></article><article className="stat-card"><small>Active subscriptions</small><strong>{data.active_count}</strong><span>{upcoming[0]?.item.name ? `${upcoming[0].item.name} renews soon` : "No renewals scheduled"}</span></article><article className="stat-card"><small>Due this week</small><strong><Money value={data.due_this_week} /></strong><span>Upcoming charges this week</span></article></div>
    <section className="dashboard-panel upcoming-card"><div className="panel-heading"><div><h2>Upcoming subscriptions</h2><small>Your next scheduled renewals</small></div><Link href="/dashboard/calendar">View calendar</Link></div>{upcoming.slice(0, 4).map(({ item, date }) => <div className="upcoming-row" key={item.id}><SubscriptionLogo item={item} /><div><b>{item.name}</b><small>{item.category}</small></div><div className="upcoming-date"><b>{renewalLabel(date)}</b><small>{date.toDateString() === new Date().toDateString() ? "Today" : "Upcoming"}</small></div><strong><Money value={item.price} /></strong></div>)}</section>
    <section className="dashboard-panel"><div className="panel-heading"><div><h2>Your subscriptions</h2><small>Track every plan and renewal</small></div><Link href="/dashboard/subscriptions">View all</Link></div>{upcoming.slice(0, 4).map(({ item }) => <SubscriptionRow key={item.id} item={item} />)}</section>
  </>;
}

function SubscriptionRow({ item }: { item: Subscription }) { const label = subscriptionDueLabel(item.nextDueDate); return <div className="subscription-row"><SubscriptionLogo item={item} /><div><b>{item.name}</b><small>{item.category}</small></div><div className="row-price"><b><Money value={item.price} /></b><small>per {item.period === "yearly" ? "year" : "month"}</small></div><div className="renewal"><b>{formatSubscriptionDate(item.nextDueDate)}</b><small className={label === "Today" || label === "Tomorrow" ? "soon" : ""}>{label}</small></div></div>; }
