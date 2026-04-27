import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SubNav } from "@/components/SubNav";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Agentic AI Dashboard",
  description: "Medical Data Management Sandbox",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased w-screen h-screen overflow-hidden flex items-center justify-center p-4 xl:p-8`}
      >
        <div className="w-full h-full flex gap-4 xl:gap-8 rounded-4xl overflow-hidden glass-panel p-4 xl:p-6 shadow-2xl relative">
          <SubNav />
          {children}
        </div>
      </body>
    </html>
  );
}
