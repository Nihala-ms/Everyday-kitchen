
import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";

import connectDB from "@/lib/mongodb";
import Recipe from "@/models/Recipe";
import RecipeReviews from "@/components/RecipeReviews";
import RecipeDetailClient from "./recipe-detail-client";

export const instant = false;

const BASE_URL = "https://everyday-kitchens.vercel.app";

interface RecipeIngredient {
  amount: number | null;
  unit: string;
  name: string;
}

interface RecipeInstruction {
  title: string;
  description: string;
}

interface RecipeData {
  _id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  imageAlt: string;
  category: string;
  cuisine: string;
  prepTime: number;
  cookTime: number;
  totalTime: number;
  servings: number;
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  tips: string[];
  servingSuggestions?: string[];
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

// Fetch published recipe.
async function getRecipe(
  slug: string
): Promise<RecipeData | null> {
  await connection();

  await connectDB();

  const recipe = await Recipe.findOne({
    slug: slug.toLowerCase(),
    status: "published",
  }).lean();

  if (!recipe) {
    return null;
  }

  const serializedRecipe = JSON.parse(
    JSON.stringify(recipe)
  ) as Omit<RecipeData, "cuisine" | "tips"> & {
    cuisine?: string;
    tips?: string[];
  };

  return {
    ...serializedRecipe,
    cuisine: serializedRecipe.cuisine || "Indian",
    tips: serializedRecipe.tips || [],
    ingredients: serializedRecipe.ingredients || [],
    instructions: serializedRecipe.instructions || [],
  };
}

// Dynamic SEO metadata for every recipe.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const recipe = await getRecipe(slug);

  if (!recipe) {
    return {
      title: "Recipe Not Found | Everyday Kitchen",
      description:
        "The recipe you are looking for could not be found.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonicalUrl = `${BASE_URL}/recipes/${recipe.slug}`;

  const title =
    recipe.seo?.title ||
    `${recipe.title} | Everyday Kitchen`;

  const description =
    recipe.seo?.description || recipe.description;

  const keywords = recipe.seo?.keywords?.length
    ? recipe.seo.keywords
    : [
        recipe.title,
        `${recipe.title} recipe`,
        recipe.category,
        `${recipe.cuisine} recipes`,
      ];

  return {
    title,
    description,
    keywords,

    alternates: {
      canonical: canonicalUrl,
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
      title,
      description,
      url: canonicalUrl,
      siteName: "Everyday Kitchens",
      locale: "en_IN",
      type: "article",
      images: recipe.image
        ? [
            {
              url: recipe.image,
              alt: recipe.imageAlt || recipe.title,
            },
          ]
        : [],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: recipe.image ? [recipe.image] : [],
    },
  };
}

// Recipe details page.
export default async function RecipeDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const recipe = await getRecipe(slug);

  if (!recipe) {
    notFound();
  }

  const canonicalUrl = `${BASE_URL}/recipes/${recipe.slug}`;

  // Recipe keywords.
  const recipeKeywords = recipe.seo?.keywords?.length
    ? recipe.seo.keywords
    : [
        recipe.title,
        `${recipe.title} recipe`,
        recipe.category,
        `${recipe.cuisine} cuisine`,
      ];

  // Recipe structured data.
  const recipeSchema = {
    "@context": "https://schema.org",
    "@type": "Recipe",

    "@id": `${canonicalUrl}#recipe`,
    url: canonicalUrl,

    name: recipe.title,
    description: recipe.description,

    image: recipe.image ? [recipe.image] : [],

    keywords: recipeKeywords.join(", "),

    author: {
      "@type": "Organization",
      name: "Everyday Kitchens",
      url: BASE_URL,
    },

    recipeCategory: recipe.category,
    recipeCuisine: recipe.cuisine,

    prepTime: `PT${recipe.prepTime}M`,
    cookTime: `PT${recipe.cookTime}M`,
    totalTime: `PT${recipe.totalTime}M`,

    recipeYield: `${recipe.servings} servings`,

    recipeIngredient: recipe.ingredients.map(
      (ingredient) => {
        const amount =
          ingredient.amount !== null &&
          ingredient.amount !== undefined
            ? `${ingredient.amount} `
            : "";

        return `${amount}${ingredient.unit || ""} ${ingredient.name}`.trim();
      }
    ),

    recipeInstructions: recipe.instructions.map(
      (instruction, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        name: instruction.title,
        text: instruction.description,
        url: `${canonicalUrl}#step-${index + 1}`,
      })
    ),
  };

  // Safely serialize JSON-LD.
  const jsonLd = JSON.stringify(recipeSchema).replace(
    /</g,
    "\\u003c"
  );

  return (
    <>
      {/* Recipe JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd,
        }}
      />

      <main className="min-h-screen overflow-x-hidden bg-[#fffdf8] text-[#26352c]">

        {/* Recipe content */}
        <RecipeDetailClient recipe={recipe} />

        {/* Ratings and Reviews */}
        <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
          <RecipeReviews slug={recipe.slug} />
        </div>

      </main>
    </>
  );
}
