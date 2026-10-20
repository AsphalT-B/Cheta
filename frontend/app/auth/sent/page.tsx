"use client";
import { useRouter } from "next/navigation";
import { AuthShell, IconBox } from "../components";

export default function SentPage() { const router = useRouter(); return <AuthShell view="sent"><IconBox /><h1>Check your email.</h1><p className="sub">We sent a reset link to <b className="ink">your email address</b>. It expires in 30 minutes.</p><button className="button" onClick={() => router.push("/auth/reset")}>Open reset link</button><p className="foot">Didn&apos;t get it? <button className="link" onClick={() => undefined}>Resend email</button></p></AuthShell>; }
