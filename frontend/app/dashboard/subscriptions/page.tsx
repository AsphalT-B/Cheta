"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AddSubscriptionButton, AddSubscriptionDialog, DashboardHeader, DeleteSubscriptionDialog, ErrorState, LoadingState, Money, SubscriptionLogo } from "../components";
import type { Subscription } from "../data";
import { useSubscriptionsQuery } from "../queries";

export default function SubscriptionsPage() {
  const { data, isLoading, isError } = useSubscriptionsQuery();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [deleting, setDeleting] = useState<Subscription | null>(null);
  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState />;
  const monthly = data.reduce((sum, item) => sum + (item.period === "yearly" ? item.price / 12 : item.price), 0);
  function confirmDelete() { setDeleting(null); queryClient.invalidateQueries({ queryKey: ["dashboard"] }); }
  return <><DashboardHeader title="Subscriptions" subtitle={`${data.length} active, ${new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 2 }).format(monthly)} a month.`} action={<AddSubscriptionButton />} /><section className="dashboard-panel">{data.map(item => <div className="subscription-row detailed" key={item.id}><SubscriptionLogo item={item} /><div><b>{item.name}</b><small>{item.category}</small></div><div className="row-price"><b><Money value={item.price} /></b><small>per {item.period === "yearly" ? "year" : "month"}</small></div><div className="renewal"><b>May {item.billingDay}</b><small className={item.billingDay <= 3 ? "soon" : ""}>{item.billingDay <= 3 ? "Renews soon" : `in ${item.billingDay} days`}</small></div><div className="row-actions"><button type="button" aria-label={`Edit ${item.name}`} onClick={() => setEditing(item)}><Pencil size={17} /></button><button type="button" aria-label={`Delete ${item.name}`} onClick={() => setDeleting(item)}><Trash2 size={17} /></button></div></div>)}</section>{editing && <AddSubscriptionDialog key={editing.id} subscription={editing} onClose={() => setEditing(null)} />}{deleting && <DeleteSubscriptionDialog subscription={deleting} onCancel={() => setDeleting(null)} onConfirm={confirmDelete} />}</>;
}
