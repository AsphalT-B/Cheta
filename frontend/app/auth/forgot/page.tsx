"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell, emailPattern, Field } from "../components";

export default function ForgotPasswordPage() { const router = useRouter(); const [email, setEmail] = useState(""); const [submitted, setSubmitted] = useState(false); const validEmail = emailPattern.test(email); function submit(event: FormEvent) { event.preventDefault(); setSubmitted(true); if (validEmail) router.push(`/auth/sent?email=${encodeURIComponent(email)}`); } return <AuthShell view="forgot"><a className="link back" href="/auth/signin">‹ <span>Back to sign in</span></a><h1>Forgot your password?</h1><p className="sub">Enter your email and we&apos;ll send a link to reset it.</p><form onSubmit={submit}><Field label="Email address" id="email" type="email" placeholder="you@example.com" value={email} onChange={setEmail} error={submitted && !validEmail ? "Enter a valid email address." : undefined} autoComplete="email" /><button className="button">Send reset link</button></form></AuthShell>; }
