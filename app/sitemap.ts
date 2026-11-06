
import type { MetadataRoute } from "next";
import connectDB from "@/lib/mongodb";
import Recipe from "@/models/Recipe";

const SITE_URL = "https://everyday-kitchens.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB();

  const recipes = await Recipe.find({ status: "published" })
    .select("slug updatedAt")
    .lean();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/recipes`,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const recipePages: MetadataRoute.Sitemap = recipes
    .filter((recipe) => Boolean(recipe.slug))
    .map((recipe) => ({
      url: `${SITE_URL}/recipes/${recipe.slug}`,
      ...(recipe.updatedAt
        ? { lastModified: new Date(recipe.updatedAt) }
        : {}),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  return [...staticPages, ...recipePages];
}
