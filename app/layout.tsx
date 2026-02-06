import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import AOSInit from "./components/AOSInit";
import CookieConsent from "./components/CookieConsent";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Cognitive Constraint Journal",
    template: "%s | Cognitive Constraint Journal",
  },
  description: "A radical academic publication advancing cognitive science with rigorous methodology. Free access for individuals with limited citation rights.",
  keywords: ["cognitive science", "psychology", "academic journal", "peer review", "behavioral science", "research"],
  authors: [{ name: "Cognitive Constraint Journal" }],
  openGraph: {
    title: "Cognitive Constraint Journal",
    description: "Paradigm shifting requires a new publication model. Free access with limited citation rights.",
    url: "https://cognitiveconstraint.com",
    siteName: "Cognitive Constraint Journal",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cognitive Constraint Journal",
    description: "Paradigm shifting requires a new publication model. Free access with limited citation rights.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AOSInit />
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
