import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import { requireAdmin } from "@/lib/admin-auth";
import Review from "@/models/Review";

export async function GET() {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    await connectDB();

    const reviews = await Review.find({})
      .populate("recipeId", "title slug")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("Admin reviews GET error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load reviews." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    await connectDB();

    const body = await request.json();
    const { reviewId, status } = body;

    if (
      typeof reviewId !== "string" ||
      !mongoose.Types.ObjectId.isValid(reviewId)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid review ID." },
        { status: 400 }
      );
    }

    if (
      typeof status !== "string" ||
      !["approved", "rejected", "pending"].includes(status)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid review status." },
        { status: 400 }
      );
    }

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { status },
      { new: true, runValidators: true }
    );

    if (!review) {
      return NextResponse.json(
        { success: false, message: "Review not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Review ${status} successfully.`,
      review,
    });
  } catch (error) {
    console.error("Admin review update error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update review." },
      { status: 500 }
    );
  }
}
