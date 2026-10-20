"use client";

import { ReactNode, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";

export type AuthView = "signin" | "signup" | "forgot" | "sent" | "reset" | "verify" | "done";
const panelCopy: Record<AuthView, [string, string]> = {
  signin: ["Every renewal, before it surprises you.", "Track all your subscriptions in one secure vault and get alerts days before you're charged."], signup: ["Find the plans you forgot you pay for.", "Add your subscriptions once. Subvault shows what you spend and what you could save."], forgot: ["Locked out? It happens.", "Reset links are single-use and expire in 30 minutes to keep your vault safe."], sent: ["Your vault stays protected.", "Your subscriptions and renewal alerts stay exactly as you left them."], reset: ["Almost back in.", "A strong password keeps every plan in your vault secure."], verify: ["One more check, then you're in.", "Two-step verification keeps your billing details private, even if a password leaks."], done: ["Welcome to your vault.", "Everything you pay for, organized in one secure place."],
};

export function AuthShell({ view, children }: { view: AuthView; children: ReactNode }) {
  return <div className="shell"><section className="left"><div className="brand-row"><div className="brand"><span className="logo">⌁</span><span><b>Subvault</b><small>SMART SUBSCRIPTIONS</small></span></div><ThemeToggle /></div><main className="main">{children}</main><p className="copy">© 2026 Subvault. Know what you pay for.</p></section><aside className="right" aria-hidden="true"><div className="spark">✦</div><h2>{panelCopy[view][0]}</h2><p>{panelCopy[view][1]}</p><div className="stage"><div className="pill">↗ <span>Saved $284.00 this year</span></div><div className="card"><header><b>Upcoming renewals</b><span className="chip">Alerts on</span></header>{[["N", "Netflix", "Renews in 2 days", "$22.99", "netflix"], ["F", "Figma", "May 29", "$15.00", "figma"], ["i", "iCloud+", "Jun 02", "$2.99", "icloud"]].map(([letter, product, date, amount, color]) => <div className="subscription" key={product}><i className={color}>{letter}</i><div><b>{product}</b><small>{date}</small></div><em>{amount}</em></div>)}</div><div className="spend"><small>Monthly spend</small><b>$147.83</b><div className="bars"><i /><i /><i /><i /><i /></div></div></div></aside></div>;
}

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("subvault-theme");
    const isDark = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(isDark);
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    window.localStorage.setItem("subvault-theme", next ? "dark" : "light");
  }

  return <button className="theme-toggle" type="button" onClick={toggle} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} aria-pressed={dark}><span aria-hidden="true">{dark ? "☀" : "☾"}</span><span className="theme-label">{dark ? "Light" : "Dark"}</span></button>;
}

export function Field({ label, id, type = "text", placeholder, value, onChange, error, autoComplete }: { label: string; id: string; type?: string; placeholder: string; value: string; onChange: (value: string) => void; error?: string; autoComplete?: string }) { return <div className={`field ${error ? "bad" : ""}`}><label htmlFor={id}>{label}</label><input id={id} type={type} placeholder={placeholder} value={value} onChange={event => onChange(event.target.value)} autoComplete={autoComplete} aria-invalid={Boolean(error)} />{error && <FieldError message={error} />}</div>; }
export function PasswordField({ label, id, placeholder, value, onChange, error, autoComplete, visible, onToggle }: { label: string; id: string; placeholder: string; value: string; onChange: (value: string) => void; error?: string; autoComplete?: string; visible: boolean; onToggle: () => void }) { return <div className={`field ${error ? "bad" : ""}`}><label htmlFor={id}>{label}</label><div className="input-wrap"><input id={id} type={visible ? "text" : "password"} placeholder={placeholder} value={value} onChange={event => onChange(event.target.value)} autoComplete={autoComplete} aria-invalid={Boolean(error)} /><button className="eye" type="button" aria-label={visible ? "Hide password" : "Show password"} onClick={onToggle}><EyeIcon off={visible} /></button></div>{error && <FieldError message={error} />}</div>; }
export function FieldError({ message }: { message: string }) { return <div className="field-error" role="alert"><AlertCircle size={16} aria-hidden="true" /><span>{message}</span></div>; }
export function MessageBanner({ tone, title, message }: { tone: "error" | "warning" | "success" | "info"; title: string; message: string }) { const Icon = tone === "error" ? AlertCircle : tone === "warning" ? TriangleAlert : tone === "success" ? CheckCircle2 : Info; return <div className={`message-banner message-${tone}`} role={tone === "error" || tone === "warning" ? "alert" : "status"}><Icon size={20} aria-hidden="true" /><div><b>{title}</b><span>{message}</span></div></div>; }
export function EyeIcon({ off = false }: { off?: boolean }) { return off ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 3l18 18M10.6 6.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.5 6.6A17 17 0 0 0 2 12s3.6 7 10 7c1.7 0 3.2-.4 4.5-1M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>; }
export function GoogleIcon() { return <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.6a4.8 4.8 0 0 1-2.1 3.1v2.6h3.4c2-1.8 3.1-4.5 3.1-7.5Z" /><path fill="#34A853" d="M12 22.4c2.8 0 5.2-.9 6.9-2.5l-3.4-2.6c-.9.6-2.1 1-3.5 1a6.1 6.1 0 0 1-5.8-4.2H2.7v2.7A10.4 10.4 0 0 0 12 22.4Z" /><path fill="#FBBC05" d="M6.2 14.1a6.2 6.2 0 0 1 0-4V7.4H2.7a10.4 10.4 0 0 0 0 9.4l3.5-2.7Z" /><path fill="#EA4335" d="M12 5.9c1.5 0 2.9.5 4 1.6l3-3A10.3 10.3 0 0 0 12 1.6 10.4 10.4 0 0 0 2.7 7.4l3.5 2.7A6.1 6.1 0 0 1 12 5.9Z" /></svg>; }
export function IconBox({ kind = "mail", success = false }: { kind?: "mail" | "shield"; success?: boolean }) { return <div className={`icon-big ${success ? "success" : ""}`}>{kind === "mail" ? <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 8 8 6 8-6" /></svg> : <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3 4 6v6c0 4.5 3.2 7.6 8 9 4.8-1.4 8-4.5 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></svg>}</div>; }
export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export function strengthFor(value: string) { return [value.length >= 8, /[A-Z]/.test(value) && /[a-z]/.test(value), /\d/.test(value), /[^\w\s]/.test(value)].filter(Boolean).length; }
export function BackButton({ href = "/auth/signin" }: { href?: string }) { return <a className="link back" href={href}>‹ <span>Back to sign in</span></a>; }
