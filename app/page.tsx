import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Easy Kerala & Indian Recipes | Everyday Kitchen",
  description:
    "Discover easy Kerala and Indian recipes with simple ingredients, step-by-step instructions and delicious homemade food ideas.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Everyday Kitchen | Easy Kerala & Indian Recipes",
    description:
      "Explore delicious homemade Kerala and Indian recipes for everyday cooking.",
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Everyday Kitchen | Easy Kerala & Indian Recipes",
    description:
      "Discover easy homemade Kerala and Indian recipes.",
  },
};

export default function HomePage() {
  return <HomeClient />;
}