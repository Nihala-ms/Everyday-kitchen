import connectDB from "@/lib/mongodb";
import Recipe from "@/models/Recipe";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  const denied = await requireAdmin();

  if (denied) {
    return denied;
  }

  try {
    await connectDB();

    const recipes = await Recipe.find({})
      .sort({ createdAt: -1 })
      .lean();

    const totalRecipes = recipes.length;

    const publishedRecipes = recipes.filter(
      (recipe) => recipe.status === "published"
    ).length;

    const draftRecipes = recipes.filter(
      (recipe) => recipe.status === "draft"
    ).length;

    return Response.json({
      success: true,
      stats: {
        totalRecipes,
        publishedRecipes,
        draftRecipes,
      },
      recipes,
    });
  } catch (error) {
    console.error("ADMIN API ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to fetch admin recipes",
      },
      { status: 500 }
    );
  }
}
