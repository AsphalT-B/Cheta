"use client";

import { FormEvent, useEffect, useState } from "react";
import { authClient } from "../../lib/auth-client";
import { Spinner } from "../../components/spinner";
import { DashboardHeader, DashboardMessage, ErrorState, LoadingState, LogoutButton } from "../components";
import { updateSettings, useSettingsQuery } from "../queries";

const REMINDER_OPTIONS = [7, 3, 1, 0];

export default function SettingsPage() {
  const session = authClient.useSession();
  const settings = useSettingsQuery();
  const [reminders, setReminders] = useState(REMINDER_OPTIONS);
  const [inApp, setInApp] = useState(true);
  const [email, setEmail] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [timezone, setTimezone] = useState("UTC");
  const [name, setName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "error" | "success"; message: string } | null>(null);

  // Form state is synchronized with the server-backed settings once loaded.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (settings.data) {
      setReminders(settings.data.renewal_reminder_days ?? REMINDER_OPTIONS);
      setInApp(settings.data.in_app_notifications_enabled ?? true);
      setEmail(settings.data.email_notifications_enabled ?? true);
      setWeeklySummary(settings.data.weekly_summary_enabled);
      setTheme(settings.data.theme);
      setTimezone(settings.data.timezone);
    }
  }, [settings.data]);
  useEffect(() => { if (session.data?.user.name) setName(session.data.user.name); }, [session.data?.user.name]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (settings.isLoading || session.isPending) return <LoadingState />;
  if (settings.isError || !settings.data || !session.data) return <ErrorState />;

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    setSavingProfile(true);
    try {
      const result = await authClient.updateUser({ name: name.trim() });
      if (result.error) throw new Error(result.error.message);
      setFeedback({ tone: "success", message: "Profile updated." });
      await session.refetch();
    } catch (error) { setFeedback({ tone: "error", message: error instanceof Error ? error.message : "Unable to update profile" }); }
    finally { setSavingProfile(false); }
  }

  async function saveSettings(event: FormEvent) {
    event.preventDefault();
    setSavingSettings(true);
    try {
      const updated = await updateSettings({ renewal_reminder_days: reminders, in_app_notifications_enabled: inApp, email_notifications_enabled: email, weekly_summary_enabled: weeklySummary, theme, timezone });
      await settings.refetch();
      setTheme(updated.theme);
      setFeedback({ tone: "success", message: "Settings saved." });
    } catch (error) { setFeedback({ tone: "error", message: error instanceof Error ? error.message : "Unable to save settings" }); }
    finally { setSavingSettings(false); }
  }

  function toggleReminder(day: number) {
    setReminders(current => current.includes(day) ? current.filter(value => value !== day) : [...current, day].sort((a, b) => b - a));
  }

  return <>
    <DashboardHeader title="Settings" subtitle="Manage your profile, alerts and appearance." />
    {feedback && <DashboardMessage tone={feedback.tone} message={feedback.message} onDismiss={() => setFeedback(null)} />}
    <section className="dashboard-panel settings-panel"><div className="panel-heading"><h2>Profile</h2></div><form onSubmit={saveProfile}><label className="dashboard-field"><span>Full name</span><input value={name} onChange={event => setName(event.target.value)} required /></label><label className="dashboard-field"><span>Email address</span><input type="email" value={session.data.user.email} readOnly /></label><button className="dashboard-button" disabled={savingProfile}>{savingProfile ? <Spinner label="Savingâ€¦" /> : "Save changes"}</button></form></section>
    <section className="dashboard-panel settings-panel"><form onSubmit={saveSettings}><div className="panel-heading"><div><h2>Alerts</h2><small>Choose when Cheta reminds you about renewals.</small></div></div><div className="reminder-options">{REMINDER_OPTIONS.map(day => <label className="setting-row" key={day}><span><b>{day === 0 ? "On the renewal date" : `${day} days before`}</b></span><input className="switch" type="checkbox" checked={reminders.includes(day)} onChange={() => toggleReminder(day)} /></label>)}</div><label className="setting-row"><span><b>In-app notifications</b><small>Show renewal alerts in your Cheta notification center.</small></span><input className="switch" type="checkbox" checked={inApp} onChange={event => setInApp(event.target.checked)} /></label><label className="setting-row"><span><b>Email notifications</b><small>Send renewal reminders to {session.data.user.email}.</small></span><input className="switch" type="checkbox" checked={email} onChange={event => setEmail(event.target.checked)} /></label><label className="setting-row"><span><b>Weekly summary</b><small>A short email with your spend and upcoming renewals.</small></span><input className="switch" type="checkbox" checked={weeklySummary} onChange={event => setWeeklySummary(event.target.checked)} /></label><label className="dashboard-field"><span>Theme</span><select value={theme} onChange={event => setTheme(event.target.value as "light" | "dark" | "system")}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label><label className="dashboard-field"><span>Timezone</span><input value={timezone} onChange={event => setTimezone(event.target.value)} placeholder="Africa/Lagos" /></label><button className="dashboard-button" disabled={savingSettings}>{savingSettings ? <Spinner label="Savingâ€¦" /> : "Save settings"}</button></form></section>
    <section className="dashboard-panel settings-panel settings-account"><div className="panel-heading"><div><h2>Account</h2><small>Sign out of your Cheta account.</small></div></div><LogoutButton /></section>
  </>;
}

