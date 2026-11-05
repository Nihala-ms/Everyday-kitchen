import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Recipe from "@/models/Recipe";
import { requireAdmin } from "@/lib/admin-auth";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const ingredientsParam = searchParams.get("ingredients");

    const ingredients = ingredientsParam
      ? [
          ...new Set(
            ingredientsParam
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          ),
        ]
      : [];

    if (ingredients.length === 0) {
      const recipes = await Recipe.find({ status: "published" })
        .sort({ createdAt: -1 })
        .lean();

      return Response.json({
        success: true,
        count: recipes.length,
        recipes,
      });
    }

    const ingredientRegexes = ingredients.map(
      (ingredient) => new RegExp(escapeRegex(ingredient), "i")
    );

    const recipes = await Recipe.find({
      status: "published",
      ingredients: {
        $elemMatch: {
          name: { $in: ingredientRegexes },
        },
      },
    })
      .sort({ createdAt: -1 })
      .lean();

    const matchedRecipes = recipes
      .map((recipe) => {
        const matchedIngredients = ingredients.filter((selected) =>
          recipe.ingredients.some((ingredient) =>
            ingredient.name
              .toLowerCase()
              .includes(selected.toLowerCase())
          )
        );

        return {
          ...recipe,
          matchedIngredients,
          matchCount: matchedIngredients.length,
          totalSelectedIngredients: ingredients.length,
        };
      })
      .sort((a, b) => b.matchCount - a.matchCount);

    return Response.json({
      success: true,
      count: matchedRecipes.length,
      selectedIngredients: ingredients,
      recipes: matchedRecipes,
    });
  } catch (error) {
    console.error("Fetch recipes error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to fetch recipes",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Only authenticated admins can upload recipes.
    const denied = await requireAdmin();

    if (denied) {
      return denied;
    }

    await connectDB();

    const body = await request.json();
    const recipes = Array.isArray(body) ? body : [body];

    if (
      recipes.length === 0 ||
      recipes.some(
        (recipe) =>
          !recipe ||
          typeof recipe !== "object" ||
          Array.isArray(recipe)
      )
    ) {
      return Response.json(
        { success: false, message: "Invalid recipe data" },
        { status: 400 }
      );
    }

    const slugs = recipes.map((recipe) => recipe.slug);

    if (
      slugs.some(
        (slug) => typeof slug !== "string" || !slug.trim()
      )
    ) {
      return Response.json(
        {
          success: false,
          message: "Every recipe must have a valid slug",
        },
        { status: 400 }
      );
    }

    const uniqueSlugs = [...new Set(slugs)];

    if (uniqueSlugs.length !== slugs.length) {
      return Response.json(
        {
          success: false,
          message: "Duplicate slugs found in request",
        },
        { status: 400 }
      );
    }

    const existing = await Recipe.find({
      slug: { $in: uniqueSlugs },
    })
      .select("slug")
      .lean();

    const existingSlugs = existing.map((item) => item.slug);
    const existingSet = new Set(existingSlugs);

    const newRecipes = recipes
      .filter((recipe) => !existingSet.has(recipe.slug))
      .map((recipe) => ({
        ...recipe,
        status: "draft",
      }));

    if (newRecipes.length === 0) {
      return Response.json({
        success: true,
        message: "All recipes already exist",
        insertedCount: 0,
        duplicateSlugs: existingSlugs,
      });
    }

    const inserted = await Recipe.insertMany(newRecipes);

    return Response.json(
      {
        success: true,
        message: "Recipes uploaded successfully",
        insertedCount: inserted.length,
        duplicateSlugs: existingSlugs,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Bulk recipe upload error:", error);

    return Response.json(
      {
        success: false,
        message: "Recipe upload failed. Check the recipe data.",
      },
      { status: 500 }
    );
  }
}
