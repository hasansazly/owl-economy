import type { Metadata } from "next";
import { Bebas_Neue, Source_Sans_3 } from "next/font/google";

import "./globals.css";

const display = Bebas_Neue({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Owl Economy | Temple University",
  description:
    "The Owl Economy is a Temple University campus marketplace for selling goods, finding short-term rooms, launching events, and funding student ideas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} antialiased`}>{children}</body>
    </html>
  );
}
