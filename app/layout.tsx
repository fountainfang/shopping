import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { SimpleLanguageSwitcher } from "@/components/SimpleLanguageSwitcher";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

// Add Remxi Icon CDN
const remixIconCdn = "https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css";

export const metadata: Metadata = {
  title: "V-Ticket | Virtual Goods Store",
  description: "Premium virtual goods marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href={remixIconCdn} rel="stylesheet" />
      </head>
      <body className={`${inter.variable} antialiased font-sans`}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
