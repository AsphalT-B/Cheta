"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AlertCircle, BarChart3, Bell, CalendarDays, ChevronDown, Grid2X2, Layers3, LogOut, Moon, Search, SlidersHorizontal, Sun, Trash2, UserRound, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { authClient } from "../lib/auth-client";
import type { Subscription } from "./data";

const nav = [["/dashboard", "Overview", Grid2X2], ["/dashboard/subscriptions", "Subscriptions", Layers3], ["/dashboard/calendar", "Calendar", CalendarDays], ["/dashboard/insights", "Insights", BarChart3], ["/dashboard/settings", "Settings", SlidersHorizontal]] as const;

type BillingUnit = "day" | "week" | "month" | "year";

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addBillingInterval(date: Date, amount: number, unit: BillingUnit) {
  const next = new Date(date);
  if (unit === "day") next.setDate(next.getDate() + amount);
  if (unit === "week") next.setDate(next.getDate() + amount * 7);
  if (unit === "month") {
    const day = next.getDate();
    next.setDate(1);
    next.setMonth(next.getMonth() + amount);
    const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
    next.setDate(Math.min(day, lastDay));
  }
  if (unit === "year") {
    const month = next.getMonth();
    const day = next.getDate();
    next.setDate(1);
    next.setFullYear(next.getFullYear() + amount);
    next.setMonth(month);
    const lastDay = new Date(next.getFullYear(), month + 1, 0).getDate();
    next.setDate(Math.min(day, lastDay));
  }
  return next;
}

function getNextPayment(start: string, every: string, unit: BillingUnit) {
  const firstPayment = parseDate(start);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const interval = Math.max(1, Number(every) || 1);
  let next = firstPayment;
  while (next < today) next = addBillingInterval(next, interval, unit);
  return next;
}

function formatPaymentDate(date: Date) {
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname(); const router = useRouter(); const [dark, setDark] = useState(false); const [search, setSearch] = useState(""); const [profileOpen, setProfileOpen] = useState(false); const [logoutOpen, setLogoutOpen] = useState(false);
  useEffect(() => { const saved = localStorage.getItem("subvault-theme"); const isDark = saved ? saved === "dark" : matchMedia("(prefers-color-scheme: dark)").matches; // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(isDark); document.documentElement.dataset.theme = isDark ? "dark" : "light"; }, []);
  function toggleTheme() { const next = !dark; setDark(next); document.documentElement.dataset.theme = next ? "dark" : "light"; localStorage.setItem("subvault-theme", next ? "dark" : "light"); }
  function submitSearch(event: React.FormEvent) { event.preventDefault(); if (search.trim()) router.push(`/dashboard/subscriptions?q=${encodeURIComponent(search.trim())}`); }
  async function confirmLogout() { try { await authClient.signOut(); } finally { setLogoutOpen(false); setProfileOpen(false); router.replace("/auth/signin"); } }
  const [addOpen, setAddOpen] = useState(false);
  useEffect(() => { const open = () => setAddOpen(true); const openLogout = () => setLogoutOpen(true); window.addEventListener("open-add-subscription", open); window.addEventListener("open-logout-confirmation", openLogout); return () => { window.removeEventListener("open-add-subscription", open); window.removeEventListener("open-logout-confirmation", openLogout); }; }, []);
  return <div className="dashboard-app"><aside className="dashboard-sidebar"><div className="dashboard-brand"><span className="dashboard-logo"><Layers3 size={22} strokeWidth={2.2} /></span><span><b>Cheta</b><small>SMART SUBSCRIPTIONS</small></span></div><nav className="dashboard-nav">{nav.map(([href, label, Icon]) => <Link className={pathname === href ? "active" : ""} href={href} key={href}><Icon size={21} strokeWidth={1.8} /><span>{label}</span>{label === "Subscriptions" && <em>8</em>}</Link>)}</nav><div className="vault-note"><b>Your vault is protected</b><span>Renewal alerts are active for every subscription.</span></div></aside><main className="dashboard-main"><header className="dashboard-top"><form className="dashboard-search" onSubmit={submitSearch}><Search size={18} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search your subscriptions" aria-label="Search subscriptions" /></form><div className="dashboard-actions"><button type="button" className="dashboard-icon" onClick={toggleTheme} aria-label="Toggle dark mode">{dark ? <Sun size={18} /> : <Moon size={18} />}</button><button type="button" className="dashboard-icon" aria-label="Notifications"><Bell size={18} /></button><div className="profile-menu"><button type="button" className="avatar profile-trigger" onClick={() => setProfileOpen(value => !value)} aria-expanded={profileOpen} aria-label="Open profile menu">JD</button>{profileOpen && <div className="profile-dropdown"><div className="profile-summary"><span className="profile-avatar"><UserRound size={16} /></span><span><b>Jordan Dale</b><small>jordan@example.com</small></span></div><button type="button" className="profile-logout" onClick={() => setLogoutOpen(true)}><LogOut size={16} /> Log out</button></div>}</div></div></header><div className="dashboard-content">{children}</div></main>{addOpen && <AddSubscriptionDialog onClose={() => setAddOpen(false)} />}{logoutOpen && <LogoutConfirmDialog onCancel={() => setLogoutOpen(false)} onConfirm={confirmLogout} />}</div>;
}

function LogoutConfirmDialog({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) { return <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onCancel(); }}><section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="logout-title"><span className="confirm-icon"><LogOut size={22} /></span><h2 id="logout-title">Log out?</h2><p>Are you sure you want to log out of your Cheta account?</p><div className="dialog-actions"><button type="button" className="dialog-cancel" onClick={onCancel}>Cancel</button><button type="button" className="dashboard-button" onClick={onConfirm}>Log out</button></div></section></div>; }

export function SubscriptionLogo({ item }: { item: Pick<Subscription, "name" | "color" | "logoUrl"> }) { const [failed, setFailed] = useState(false); return <i className="subscription-logo" style={{ background: item.color }}>{item.logoUrl && !failed ? <Image src={item.logoUrl} alt="" width={25} height={25} onError={() => setFailed(true)} /> : item.name[0]}</i>; }

export function AddSubscriptionButton() { return <button className="dashboard-button" onClick={() => window.dispatchEvent(new Event("open-add-subscription"))}>＋ Add subscription</button>; }
export function LogoutButton() { return <button type="button" className="settings-logout" onClick={() => window.dispatchEvent(new Event("open-logout-confirmation"))}><LogOut size={17} /> Log out</button>; }

export function AddSubscriptionDialog({ onClose, subscription }: { onClose: () => void; subscription?: Subscription }) {
  const queryClient = useQueryClient(); const [name, setName] = useState(subscription?.name ?? ""); const [price, setPrice] = useState(subscription ? String(subscription.price) : ""); const [every, setEvery] = useState("1"); const [unit, setUnit] = useState(subscription?.period === "yearly" ? "year" : "month"); const [start, setStart] = useState(subscription ? `2026-10-${String(subscription.billingDay).padStart(2, "0")}` : "2026-10-20"); const [category, setCategory] = useState(subscription?.category ?? "Entertainment"); const [saved, setSaved] = useState(false);
  function submit(event: FormEvent) { event.preventDefault(); setSaved(true); queryClient.invalidateQueries({ queryKey: ["dashboard"] }); window.setTimeout(onClose, 500); }
  const nextPayment = getNextPayment(start, every, unit as BillingUnit);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const isToday = nextPayment.getTime() === today.getTime();
  const previewDate = formatPaymentDate(nextPayment);
  return <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><section className="subscription-dialog" role="dialog" aria-modal="true" aria-labelledby="add-subscription-title"><button className="modal-close" type="button" onClick={onClose} aria-label="Close"><X size={20} /></button><h2 id="add-subscription-title">Add subscription</h2><form onSubmit={submit}><label className="dashboard-field"><span>Name</span><input autoFocus required placeholder="e.g. Spotify" value={name} onChange={event => setName(event.target.value)} /></label><div className="form-grid"><label className="dashboard-field"><span>Price (₦)</span><input required min="0" step="0.01" type="number" placeholder="9.99" value={price} onChange={event => setPrice(event.target.value)} /></label><label className="dashboard-field"><span>Billed every</span><div className="billing-row"><input required min="1" type="number" aria-label="Number of billing periods" value={every} onChange={event => setEvery(event.target.value)} /><div className="select-wrap"><select value={unit} onChange={event => setUnit(event.target.value)} aria-label="Billing period"><option value="day">day</option><option value="week">week</option><option value="month">month</option><option value="year">year</option></select><ChevronDown size={18} /></div></div></label></div><label className="dashboard-field"><span>Billing start date</span><input required type="date" value={start} onChange={event => setStart(event.target.value)} /></label><label className="dashboard-field"><span>Category</span><div className="select-wrap full"><select value={category} onChange={event => setCategory(event.target.value)}><option>Entertainment</option><option>Productivity</option><option>Design</option><option>Storage</option></select><ChevronDown size={18} /></div></label><div className="payment-preview">Next payment: <b>{previewDate}</b>{isToday && <span> (today)</span>}</div><div className="dialog-actions"><button type="button" className="dialog-cancel" onClick={onClose}>Cancel</button><button type="submit" className="dashboard-button">{saved ? "Added" : "Add subscription"}</button></div></form></section></div>;
}

export function DeleteSubscriptionDialog({ subscription, onCancel, onConfirm }: { subscription: Subscription; onCancel: () => void; onConfirm: () => void }) { return <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onCancel(); }}><section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-subscription-title"><span className="confirm-icon"><Trash2 size={22} /></span><h2 id="delete-subscription-title">Delete subscription?</h2><p>Are you sure you want to remove <b>{subscription.name}</b> from your vault?</p><div className="dialog-actions"><button type="button" className="dialog-cancel" onClick={onCancel}>Cancel</button><button type="button" className="danger-button" onClick={onConfirm}>Delete</button></div></section></div>; }
export function LoadingState() { return <div className="dashboard-panel dashboard-loading">Loading your vault…</div>; }
export function ErrorState() { return <div className="dashboard-panel dashboard-loading"><div className="message-banner message-error" role="alert"><AlertCircle size={20} aria-hidden="true" /><div><b>We couldn&apos;t load your dashboard data.</b><span>Check your connection and try again.</span></div></div></div>; }
export function Money({ value }: { value: number }) { return <>{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 2 }).format(value)}</>; }
export function DashboardHeader({ title, subtitle, action }: { title: string; subtitle: ReactNode; action?: ReactNode }) { return <div className="dashboard-header"><div><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>; }
