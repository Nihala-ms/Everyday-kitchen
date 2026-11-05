import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://everyday-kitchen.vercel.app"),

  title: {
    default: "Everyday Kitchen | Easy Kerala & Indian Recipes",
    template: "%s | Everyday Kitchen",
  },

  description:
    "Discover easy Kerala and Indian recipes with simple ingredients, step-by-step instructions and delicious homemade food ideas.",

  keywords: [
    "Kerala recipes",
    "easy Indian recipes",
    "Kerala breakfast recipes",
    "homemade recipes",
    "traditional Kerala food",
  ],

  openGraph: {
    title: "Everyday Kitchen | Easy Kerala & Indian Recipes",
    description:
      "Explore delicious homemade Kerala and Indian recipes.",
    type: "website",
    siteName: "Everyday Kitchen",
    locale: "en_IN",
    url: "https://everyday-kitchen.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body>{children}</body>
    </html>
  );
}