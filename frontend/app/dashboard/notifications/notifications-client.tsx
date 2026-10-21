"use client";

import { CheckCheck } from "lucide-react";
import { useState } from "react";
import { DashboardHeader, ErrorState, LoadingState } from "../components";
import { markAllNotificationsRead, markNotificationRead, useNotificationsQuery } from "../queries";

export default function NotificationsPage() {
  const query = useNotificationsQuery();
  const [feedback, setFeedback] = useState<{ tone: "error" | "success"; message: string } | null>(null);
  void feedback;
  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) return <ErrorState />;
  async function markRead(id: string) { try { setFeedback(null); await markNotificationRead(id); await query.refetch(); } catch { setFeedback({ tone: "error", message: "Something went wrong." }); } }
  async function markAllRead() { try { setFeedback(null); await markAllNotificationsRead(); await query.refetch(); setFeedback({ tone: "success", message: "Notifications marked as read." }); } catch { setFeedback({ tone: "error", message: "Something went wrong." }); } }
  return <><DashboardHeader title="Notifications" subtitle="Renewal alerts and account updates." action={<button type="button" className="dashboard-button" onClick={markAllRead}><CheckCheck size={17} /> Mark all read</button>} /><section className="dashboard-panel notifications-page-panel">{query.data.items.length ? query.data.items.map(item => <button type="button" className={`notification-page-item ${item.read ? "read" : ""}`} key={item.id} onClick={() => markRead(item.id)}><span className="notification-page-icon">{item.read ? "âœ“" : "!"}</span><span><b>{item.title}</b><small>{item.message}</small><em>{new Date(item.createdAt).toLocaleString("en-NG")}</em></span></button>) : <div className="dashboard-loading">You&apos;re all caught up.</div>}</section></>;
}

