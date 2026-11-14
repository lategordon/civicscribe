import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CivicScribe | Municipal RFP Compliance Auditor & Bid Writer",
  description: "AI Municipal RFP Compliance Auditor and Proposal Bid Writer for local small-business service contractors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-50 antialiased">
      <body className="min-h-full flex flex-col text-slate-800">{children}</body>
    </html>
  );
}
