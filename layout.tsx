import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Apex F1 | Race Tracker",
  description: "A clean Formula 1 race tracker with calendar, standings and session status."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
