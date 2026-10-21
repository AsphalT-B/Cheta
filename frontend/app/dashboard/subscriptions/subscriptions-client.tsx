"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AddSubscriptionButton, AddSubscriptionDialog, DashboardHeader, DashboardMessage, DeleteSubscriptionDialog, ErrorState, LoadingState, Money, SubscriptionLogo } from "../components";
import { formatSubscriptionDate, subscriptionDueLabel, type Subscription } from "../data";
import { deleteSubscription, useSubscriptionsQuery } from "../queries";

export default function SubscriptionsClient() {
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  // The URL is only available in the browser for this client component.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setSearchInput(new URLSearchParams(window.location.search).get("q") ?? ""); }, []);
  useEffect(() => { const timer = window.setTimeout(() => setSearch(searchInput), 300); return () => window.clearTimeout(timer); }, [searchInput]);
  const { data, isLoading, isError } = useSubscriptionsQuery(search);
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [deleting, setDeleting] = useState<Subscription | null>(null);
  const [feedback, setFeedback] = useState<{ tone: "error" | "success"; message: string } | null>(null);
  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState />;
  const monthly = data.reduce((sum, item) => sum + (item.monthlyEquivalent ?? (item.period === "yearly" ? item.price / 12 : item.price)), 0);
  async function confirmDelete() {
    if (!deleting) return;
    try {
      setFeedback(null);
      await deleteSubscription(deleting.id);
      setDeleting(null);
      setFeedback({ tone: "success", message: "Subscription deleted." });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["subscriptions"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] }),
        queryClient.invalidateQueries({ queryKey: ["calendar"] }),
        queryClient.invalidateQueries({ queryKey: ["insights"] }),
      ]);
    } catch (error) {
      setFeedback({ tone: "error", message: error instanceof Error ? error.message : "Unable to delete subscription" });
    }
  }
  return <>
    <DashboardHeader title="Subscriptions" subtitle={`${data.length} active, ${new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 2 }).format(monthly)} a month.`} action={<AddSubscriptionButton />} />
    <label className="dashboard-search subscriptions-search"><span className="sr-only">Search subscriptions</span><input value={searchInput} onChange={event => setSearchInput(event.target.value)} placeholder="Search subscriptions" /></label>
    {feedback && <DashboardMessage tone={feedback.tone} message={feedback.message} onDismiss={() => setFeedback(null)} />}
    <section className="dashboard-panel">{data.map(item => { const label = subscriptionDueLabel(item.nextDueDate); return <div className="subscription-row detailed" key={item.id}><SubscriptionLogo item={item} /><div><b>{item.name}</b><small>{item.category}</small></div><div className="row-price"><b><Money value={item.price} /></b><small>per {item.period === "yearly" ? "year" : "month"}</small></div><div className="renewal"><b>{formatSubscriptionDate(item.nextDueDate)}</b><small className={label === "Today" || label === "Tomorrow" ? "soon" : ""}>{label}</small></div><div className="row-actions"><button type="button" aria-label={`Edit ${item.name}`} onClick={() => setEditing(item)}><Pencil size={17} /></button><button type="button" aria-label={`Delete ${item.name}`} onClick={() => setDeleting(item)}><Trash2 size={17} /></button></div></div>; })}</section>
    {editing && <AddSubscriptionDialog key={editing.id} subscription={editing} onClose={() => setEditing(null)} />}
    {deleting && <DeleteSubscriptionDialog subscription={deleting} onCancel={() => setDeleting(null)} onConfirm={confirmDelete} />}
  </>;
}
