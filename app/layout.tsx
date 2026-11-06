
import type { Metadata } from "next";
import Script from "next/script";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const SITE_URL = "https://everyday-kitchens.vercel.app";
const GA_MEASUREMENT_ID = "G-KPBLRZ5LXQ";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  applicationName: "Everyday Kitchen",

  title: {
    default: "Everyday Kitchen | Easy Kerala & Indian Recipes",
    template: "%s | Everyday Kitchen",
  },

  description:
    "Discover easy Kerala and Indian recipes with simple ingredients, step-by-step instructions, cooking tips and delicious homemade food ideas.",

  keywords: [
    "Kerala recipes",
    "easy Indian recipes",
    "easy Kerala recipes",
    "Kerala breakfast recipes",
    "Kerala dinner recipes",
    "traditional Kerala food",
    "homemade recipes",
    "Indian vegetarian recipes",
    "easy homemade food",
  ],

  authors: [{ name: "Everyday Kitchen" }],
  creator: "Everyday Kitchen",
  publisher: "Everyday Kitchen",

  verification: {
    google: "8VtczuGEMmZv8BdIchuBKfLNN9oKLUEgjpP3SnNcNgY",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    title: "Everyday Kitchen | Easy Kerala & Indian Recipes",
    description:
      "Explore delicious homemade Kerala and Indian recipes with easy ingredients and step-by-step cooking instructions.",
    type: "website",
    siteName: "Everyday Kitchen",
    locale: "en_IN",
    url: SITE_URL,
  },

  twitter: {
    card: "summary_large_image",
    title: "Everyday Kitchen | Easy Kerala & Indian Recipes",
    description:
      "Discover easy Kerala and Indian recipes, cooking tips and homemade food ideas.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.variable}>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />

        <Script
          id="google-analytics"
          strategy="afterInteractive"
        >
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </head>

      <body>{children}</body>
    </html>
  );
}
