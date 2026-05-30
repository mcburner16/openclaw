import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Worth the Ticket? Command Center",
  description: "Honest Reviews. Real Reactions. Stories Matter.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Worth the Ticket?",
    startupImage: "/icons/apple-touch-icon.png",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
    icon: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-[#0a0a0a] text-white min-h-screen`}>
        <div className="flex h-screen overflow-hidden">
          {/* Desktop sidebar — hidden on mobile */}
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-[#0a0a0a] pb-safe-bottom md:pb-0">
            {/* Top safe area spacer for iOS notch/Dynamic Island */}
            <div className="h-safe-top" />
            {children}
            {/* Bottom padding so content isn't hidden behind BottomNav */}
            <div className="h-20 md:hidden" />
          </main>
        </div>
        {/* Mobile bottom nav — hidden on desktop */}
        <BottomNav />
        <Toaster />
      </body>
    </html>
  );
}
