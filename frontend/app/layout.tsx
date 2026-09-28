import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans, JetBrains_Mono } from "next/font/google";
import { Sidebar } from "@/components/layout/Sidebar";
import "./globals.css";

/*
 * Fonts are self-hosted by next/font and exposed as CSS variables.
 * globals.css turns them into the font-display / font-sans / font-mono utilities.
 */
const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-bricolage" });
const body = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-dm-sans" });
const code = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "MediQuery",
  description: "Upload a patient's scans and prescriptions, and let a team of AI agents read them together.",
};

/** The app shell: sidebar on the left, rounded content panel on the right. */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${code.variable}`}>
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex min-w-0 grow p-2 md:py-3.5 md:pr-3.5 md:pl-0">
            <main className="flex min-w-0 grow flex-col gap-[22px] rounded-panel border border-panel-border bg-panel px-4 py-6 md:px-[38px] md:py-9">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
