"use client";

import { useEffect, useState } from "react";
import { apiBaseUrl } from "../lib/auth-client";

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(base64), character => character.charCodeAt(0));
}

export function PushPermissionPrompt() {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => { setVisible(typeof window !== "undefined" && "Notification" in window && Notification.permission === "default" && "serviceWorker" in navigator && "PushManager" in window); }, []);
  async function enable() {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setVisible(false); return; }
      const registration = await navigator.serviceWorker.register("/sw.js");
      const keyResponse = await fetch(`${apiBaseUrl}/api/v1/push/public-key`, { credentials: "include" });
      const { public_key } = await keyResponse.json();
      if (!public_key) throw new Error("Browser notifications are not configured yet.");
      const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(public_key) });
      await fetch(`${apiBaseUrl}/api/v1/push/subscribe`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(subscription.toJSON()) });
      setVisible(false);
    } catch { setVisible(false); }
    finally { setBusy(false); }
  }
  if (!visible) return null;
  return <div className="push-prompt"><span>Get renewal reminders even when Cheta is closed.</span><button type="button" className="dashboard-button" onClick={enable} disabled={busy}>{busy ? "Enabling…" : "Enable browser alerts"}</button></div>;
}
