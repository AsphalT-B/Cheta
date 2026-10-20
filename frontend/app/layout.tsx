import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Cheta",
  description: "Keep every subscription in one secure vault.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en"><body><Providers>{children}</Providers></body></html>
  );
}
