import type { Metadata } from "next";
import RecipesClient from "./RecipesClient";

export const metadata: Metadata = {
  title: "All Kerala & Indian Recipes",
  description:
    "Explore easy Kerala and Indian recipes, including breakfast, lunch, dinner, snacks and desserts.",
  alternates: {
    canonical: "/recipes",
  },
  openGraph: {
    title: "All Kerala & Indian Recipes | Everyday Kitchen",
    description:
      "Discover delicious homemade Kerala and Indian recipes.",
    url: "/recipes",
    type: "website",
  },
};

export default function RecipesPage() {
  return <RecipesClient />;
}