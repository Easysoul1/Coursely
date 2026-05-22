import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { SessionProvider } from "@/components/providers/session-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coursely — Find Your Academic Path",
  description:
    "Nigerian academic career guidance platform for University of Ibadan aspirants. Get department recommendations based on your strengths.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <html lang="en" className={GeistSans.className}>
        <body>{children}</body>
      </html>
    </SessionProvider>
  );
}
