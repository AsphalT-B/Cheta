"use client";
import { useRouter } from "next/navigation";
import { AuthShell, IconBox } from "../components";

export default function DonePage() { const router = useRouter(); return <AuthShell view="done"><IconBox success /><h1>Password updated.</h1><p className="sub">Your password has been changed. Sign in with your new password.</p><button className="button" onClick={() => router.push("/auth/signin")}>Continue to sign in</button></AuthShell>; }
