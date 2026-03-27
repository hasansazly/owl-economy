import type { Metadata } from "next";
import type { CSSProperties } from "react";

import { HomeFooter } from "@/components/home-footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "mydormstash.com | Campus Marketplace",
  description:
    "MyDormStash is a campus-first marketplace for dorm deals, short stays, event drops, custom merch, and student listings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
        style={
          {
            "--font-sans":
              '"Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          } as CSSProperties
        }
      >
        {children}
        <HomeFooter />
      </body>
    </html>
  );
}
