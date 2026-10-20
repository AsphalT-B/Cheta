"use client";
import { useRouter } from "next/navigation";
import { AuthShell, IconBox } from "../components";

export default function DonePage() { const router = useRouter(); return <AuthShell view="done"><IconBox success /><h1>You&apos;re in.</h1><p className="sub">Taking you to your dashboard.</p><button className="button" onClick={() => router.push("/auth/signin")}>Go to dashboard</button></AuthShell>; }
