"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChetaLoader } from "./components/cheta-loader";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/auth/signin");
  }, [router]);

  return <ChetaLoader />;
}
