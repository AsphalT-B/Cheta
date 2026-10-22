"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "../lib/auth-client";

export function DashboardSessionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const session = authClient.useSession();
  const [hasConfirmedSession, setHasConfirmedSession] = useState(false);

  useEffect(() => {
    if (session.data) {
      setHasConfirmedSession(true);
      return;
    }
    if (session.isPending || hasConfirmedSession) return;

    let cancelled = false;
    void session.refetch().finally(() => {
      if (!cancelled) setHasConfirmedSession(true);
    });
    return () => { cancelled = true; };
  }, [hasConfirmedSession, session.data, session.isPending, session.refetch]);

  useEffect(() => {
    if (hasConfirmedSession && !session.isPending && !session.data) router.replace("/auth/signin");
  }, [hasConfirmedSession, router, session.data, session.isPending]);

  if (session.isPending || !hasConfirmedSession || !session.data) return null;

  return children;
}
