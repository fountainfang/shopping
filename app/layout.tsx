import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { SimpleLanguageSwitcher } from "@/components/SimpleLanguageSwitcher";

const inter = { variable: "--font-sans" };

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
        <script
          {...{
            nowprocket: "true",
            "data-noptimize": "1",
            "data-cfasync": "false",
            "data-wpfc-render": "false",
            "seraph-accel-crit": "1",
            "data-no-defer": "1",
          }}
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                  var script = document.createElement("script");
                  script.async = 1;
                  script.src = 'https://tpembars.com/NTUxNzIz.js?t=551723';
                  document.head.appendChild(script);
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased font-sans`}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
