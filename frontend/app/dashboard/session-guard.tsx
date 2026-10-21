"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "../lib/auth-client";
import { ChetaLoader } from "../components/cheta-loader";

export function DashboardSessionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const session = authClient.useSession();

  useEffect(() => {
    if (!session.isPending && !session.data) router.replace("/auth/signin");
  }, [router, session.data, session.isPending]);

  if (session.isPending || !session.data) return <ChetaLoader />;

  return children;
}
