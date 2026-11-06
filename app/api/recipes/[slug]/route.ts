import connectDB from "@/lib/mongodb";
import Recipe from "@/models/Recipe";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    await connectDB();

    const { slug } = await params;

    const recipe = await Recipe.findOne({
      slug: slug.toLowerCase(),
      status: "published",
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

    return Response.json(
      {
        success: true,
        message: "Recipe fetched successfully!",
        recipe,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
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