
import { Types } from "mongoose";
import connectDB from "@/lib/mongodb";
import Recipe from "@/models/Recipe";
import { requireAdmin } from "@/lib/admin-auth";

// EDIT RECIPE
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
if (denied) return denied;
  try {
    await connectDB();

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return Response.json(
        { success: false, message: "Invalid recipe ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const allowedFields = [
      "title",
      "slug",
      "description",
      "image",
      "imageAlt",
      "category",
      "cuisine",
      "prepTime",
      "cookTime",
      "totalTime",
      "servings",
      "ingredients",
      "instructions",
      "tips",
      "seo",
    ];

    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return Response.json(
        {
          success: false,
          message: "No fields provided to update",
        },
        { status: 400 }
      );
    }

    const recipe = await Recipe.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!recipe) {
      return Response.json(
        { success: false, message: "Recipe not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Recipe updated successfully!",
      recipe,
    });
  } catch (error) {
    console.error("Edit recipe error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to update recipe",
        error:
          error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUBLISH / UNPUBLISH RECIPE
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
if (denied) return denied;
  try {
    await connectDB();

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return Response.json(
        { success: false, message: "Invalid recipe ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!["draft", "published"].includes(status)) {
      return Response.json(
        {
          success: false,
          message: "Status must be draft or published",
        },
        { status: 400 }
      );
    }

    const recipe = await Recipe.findByIdAndUpdate(
      id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    )
      .select("title slug status")
      .lean();

    if (!recipe) {
      return Response.json(
        { success: false, message: "Recipe not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: `Recipe ${status} successfully!`,
      recipe,
    });
  } catch (error) {
    console.error("Update recipe status error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to update recipe status",
      },
      { status: 500 }
    );
  }
}

// DELETE RECIPE
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
if (denied) return denied;
  try {
    await connectDB();

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return Response.json(
        { success: false, message: "Invalid recipe ID" },
        { status: 400 }
      );
    }

    const recipe = await Recipe.findByIdAndDelete(id);

    if (!recipe) {
      return Response.json(
        { success: false, message: "Recipe not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Recipe deleted successfully!",
    });
  } catch (error) {
    console.error("Delete recipe error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to delete recipe",
      },
      { status: 500 }
    );
  }
}
