import type { Metadata } from "next";
import connectDB from "@/lib/mongodb";
import Recipe from "@/models/Recipe";
import RecipesClient from "./RecipesClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All Kerala & Indian Recipes | Everyday Kitchen",
  description:
    "Explore easy Kerala and Indian recipes, including breakfast, lunch, dinner, snacks and desserts. Find delicious homemade recipes for everyday cooking.",
  alternates: {
    canonical: "/recipes",
  },
  openGraph: {
    title: "All Kerala & Indian Recipes | Everyday Kitchen",
    description:
      "Discover delicious homemade Kerala and Indian recipes for everyday cooking.",
    url: "https://everyday-kitchens.vercel.app/recipes",
    type: "website",
  },
};

export default async function RecipesPage() {
  await connectDB();

  const databaseRecipes = await Recipe.find({
    status: "published",
  })
    .select(
      "title slug description image imageAlt category cuisine prepTime cookTime totalTime servings createdAt"
    )
    .sort({ createdAt: -1 })
    .lean();

  const recipes = databaseRecipes.map((recipe) => ({
    _id: String(recipe._id),
    title: recipe.title,
    slug: recipe.slug,
    description: recipe.description,
    image: recipe.image,
    imageAlt: recipe.imageAlt || recipe.title,
    category: recipe.category,
    cuisine: recipe.cuisine || "Indian",
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    totalTime: recipe.totalTime,
    servings: recipe.servings,
    createdAt: recipe.createdAt
      ? new Date(recipe.createdAt).toISOString()
      : undefined,
  }));

  return <RecipesClient initialRecipes={recipes} />;
}