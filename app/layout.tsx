import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import AuthSessionProvider from "@/app/components/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Action Items Hub",
  description: "AI-powered email and Teams chat analysis for action items and next steps",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-900 text-slate-100">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
