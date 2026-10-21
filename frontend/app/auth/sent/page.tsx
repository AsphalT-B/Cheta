"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AuthShell, IconBox } from "../components";
import { authClient, authErrorMessage } from "../../lib/auth-client";

function SentContent() {
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const email = params.get("email") ?? "your email address";

  async function resend() {
    if (!params.get("email")) return;
    setLoading(true);
    setMessage("");
    try {
      const result = await authClient.requestPasswordReset({
        email: params.get("email")!,
        redirectTo: `${window.location.origin}/auth/reset`,
      });
      setMessage(result.error ? authErrorMessage(result.error, "Unable to resend the reset link.") : "A new reset link was sent.");
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return <AuthShell view="sent"><IconBox /><h1>Check your email.</h1><p className="sub">We sent a reset link to <b className="ink">{email}</b>. It expires in 1 hour.</p>{message && <p className="foot" role="status">{message}</p>}<p className="foot">Didn&apos;t get it? <button className="link" onClick={resend} disabled={loading}>{loading ? "Sending…" : "Resend email"}</button></p></AuthShell>;
}

export default function SentPage() {
  return <Suspense fallback={<main>Loading…</main>}><SentContent /></Suspense>;
}
