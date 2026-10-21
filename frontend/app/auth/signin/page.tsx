"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell, emailPattern, Field, GoogleIcon, MessageBanner, PasswordField } from "../components";
import { Spinner } from "../../components/spinner";
import { authClient } from "../../lib/auth-client";
import { toast } from "sonner";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const validEmail = emailPattern.test(email);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    setError("");
    if (!validEmail || password.length < 8) return;
    setLoading(true);
    try {
      const result = await authClient.signIn.email({ email, password, rememberMe: true });
      if (result.error) { const message = "Something went wrong."; setError(message); toast.error(message); return; }
      toast.success("Welcome back");
      router.push("/dashboard");
    } catch { const message = "Something went wrong."; setError(message); toast.error(message); }
    finally { setLoading(false); }
  }

  async function signInWithGoogle() {
    setError("");
    setLoading(true);
    try {
      const result = await authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" });
      if (result.error) { const message = "Something went wrong."; setError(message); toast.error(message); }
    } catch { toast.error("Something went wrong."); }
    finally { setLoading(false); }
  }

  return <AuthShell view="signin"><h1>Welcome back, sign in.</h1><p className="sub">Every plan and renewal is right where you left it.</p>{error && <MessageBanner tone="error" title="Sign-in failed" message="Something went wrong." />}{submitted && (!validEmail || password.length < 8) && <MessageBanner tone="error" title="Check your details" message="Enter a valid email and a password with at least 8 characters." />}<button className="button alt" type="button" onClick={signInWithGoogle} disabled={loading}>{loading ? <Spinner label="Signing in…" /> : <><GoogleIcon />Continue with Google</>}</button><div className="or">or use your email</div><form onSubmit={submit}><Field label="Email address" id="email" type="email" placeholder="you@example.com" value={email} onChange={setEmail} error={submitted && !validEmail ? "Enter a valid email address." : undefined} autoComplete="email" /><PasswordField label="Password" id="password" placeholder="At least 8 characters" value={password} onChange={setPassword} error={submitted && password.length < 8 ? "Password must be at least 8 characters." : undefined} autoComplete="current-password" visible={visible} onToggle={() => setVisible(!visible)} /><div className="row"><label className="check"><input type="checkbox" />Remember me</label><button type="button" className="link" onClick={() => router.push("/auth/forgot")}>Forgot password?</button></div><button className={`button${loading ? " has-spinner" : ""}`} disabled={loading}>{loading ? <Spinner /> : "Sign in"}</button></form><p className="foot">New to Cheta? <button className="link" onClick={() => router.push("/auth/signup")}>Create account</button></p></AuthShell>;
}
