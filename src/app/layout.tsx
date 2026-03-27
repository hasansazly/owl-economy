import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { HomeFooter } from "@/components/home-footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

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
      <body className={`${inter.variable} antialiased`}>
        {children}
        <HomeFooter />
      </body>
    </html>
  );
}
