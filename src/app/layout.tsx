import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import { AccessibilityProvider } from "@/providers/AccessibilityProvider";
import { AccessibilityButton } from "@/components/accessibility/AccessibilityButton";
import { AccessibilityPanel } from "@/components/accessibility/AccessibilityPanel";
import { CompareProvider } from "@/context/CompareContext";
import { CompareSideDrawer } from "@/components/compare/CompareSideDrawer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "C2Talents | India's Premium College Discovery & AI Counselor",
  description: "Get personalized college matches based on your scores, budget, and placements, guided by India's first AI-powered admissions counselor.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

import { FloatingCounselorButton } from "@/components/home/FloatingCounselorButton";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${lora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900 font-sans">
        <AccessibilityProvider>
          <AuthProvider>
            <CompareProvider>
              {children}
              <CompareSideDrawer />
              <FloatingCounselorButton />
            </CompareProvider>
          </AuthProvider>
          
          {/* Global Accessibility Widgets */}
          {/* <AccessibilityButton /> */}
          {/* <AccessibilityPanel /> */}
        </AccessibilityProvider>
      </body>
    </html>
  );
}

