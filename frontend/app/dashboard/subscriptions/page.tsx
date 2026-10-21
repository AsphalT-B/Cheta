"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AddSubscriptionButton, AddSubscriptionDialog, DashboardHeader, DeleteSubscriptionDialog, ErrorState, LoadingState, Money, SubscriptionLogo } from "../components";
import { formatSubscriptionDate, subscriptionDueLabel, type Subscription } from "../data";
import { useSubscriptionsQuery } from "../queries";
import { deleteSubscription } from "../queries";
import { toast } from "sonner";

export default function SubscriptionsPage() {
  const [search, setSearch] = useState("");
  useEffect(() => { setSearch(new URLSearchParams(window.location.search).get("q") ?? ""); }, []);
  const { data, isLoading, isError } = useSubscriptionsQuery(search);
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [deleting, setDeleting] = useState<Subscription | null>(null);
  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState />;
  const monthly = data.reduce((sum, item) => sum + (item.monthlyEquivalent ?? (item.period === "yearly" ? item.price / 12 : item.price)), 0);
  async function confirmDelete() { if (!deleting) return; try { await deleteSubscription(deleting.id); toast.success("Subscription deleted"); setDeleting(null); await queryClient.invalidateQueries({ queryKey: ["subscriptions"] }); await queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] }); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to delete subscription"); } }
  return <><DashboardHeader title="Subscriptions" subtitle={`${data.length} active, ${new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 2 }).format(monthly)} a month.`} action={<AddSubscriptionButton />} /><section className="dashboard-panel">{data.map(item => { const label = subscriptionDueLabel(item.nextDueDate); return <div className="subscription-row detailed" key={item.id}><SubscriptionLogo item={item} /><div><b>{item.name}</b><small>{item.category}</small></div><div className="row-price"><b><Money value={item.price} /></b><small>per {item.period === "yearly" ? "year" : "month"}</small></div><div className="renewal"><b>{formatSubscriptionDate(item.nextDueDate)}</b><small className={label === "Today" || label === "Tomorrow" ? "soon" : ""}>{label}</small></div><div className="row-actions"><button type="button" aria-label={`Edit ${item.name}`} onClick={() => setEditing(item)}><Pencil size={17} /></button><button type="button" aria-label={`Delete ${item.name}`} onClick={() => setDeleting(item)}><Trash2 size={17} /></button></div></div>; })}</section>{editing && <AddSubscriptionDialog key={editing.id} subscription={editing} onClose={() => setEditing(null)} />}{deleting && <DeleteSubscriptionDialog subscription={deleting} onCancel={() => setDeleting(null)} onConfirm={confirmDelete} />}</>;
}
