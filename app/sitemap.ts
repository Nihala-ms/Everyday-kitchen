import type { MetadataRoute } from "next";
import connectDB from "@/lib/mongodb";
import Recipe from "@/models/Recipe";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://everyday-kitchens.vercel.app";

  await connectDB();

  const recipes = await Recipe.find({ status: "published" })
    .select("slug updatedAt")
    .lean();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/recipes`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    
  ];

  const recipePages: MetadataRoute.Sitemap = recipes.map((recipe) => ({
    url: `${baseUrl}/recipes/${recipe.slug}`,
    lastModified: recipe.updatedAt ?? new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...recipePages];
}
