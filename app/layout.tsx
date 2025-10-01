import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteChrome from "./components/SiteChrome";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fracassa Autolinee",
  description: "Trasporto pubblico, noleggio autobus e minibus, Teramo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ fontFamily: "var(--font-sans-base)" }}
      >
        <a href="#main-content" className="skip-link">Salta al contenuto principale</a>
        <SiteChrome>
          <main id="main-content" role="main">
            {children}
          </main>
        </SiteChrome>
      </body>
    </html>
  );
}
