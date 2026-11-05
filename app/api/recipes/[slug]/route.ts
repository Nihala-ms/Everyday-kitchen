
import connectDB from "@/lib/mongodb";
import Recipe from "@/models/Recipe";

// GET: Fetch a single recipe using its slug
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();

    const { slug } = await params;

    const recipe = await Recipe.findOne({
      slug: slug.toLowerCase(),
    }).lean();

    if (!recipe) {
      return Response.json(
        {
          success: false,
          message: "Recipe not found",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Recipe fetched successfully!",
      recipe,
    });
  } catch (error) {
    console.error("Fetch recipe error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to fetch recipe",
      },
      { status: 500 }
    );
  }
}
