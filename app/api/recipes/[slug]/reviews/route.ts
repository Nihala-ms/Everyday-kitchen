import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Recipe from "@/models/Recipe";
import Review from "@/models/Review";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

// GET: Fetch approved reviews and rating summary
export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    await connectDB();

    const { slug } = await params;

    const recipe = await Recipe.findOne({
      slug: slug.toLowerCase(),
      status: "published",
    }).select("_id");

    if (!recipe) {
      return NextResponse.json(
        { success: false, message: "Recipe not found." },
        { status: 404 }
      );
    }

    const reviews = await Review.find({
      recipeId: recipe._id,
      status: "approved",
    })
      .select("name rating comment createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const totalReviews = reviews.length;

    const averageRating =
      totalReviews > 0
        ? Number(
            (
              reviews.reduce((total, review) => total + review.rating, 0) /
              totalReviews
            ).toFixed(1)
          )
        : 0;

    return NextResponse.json({
      success: true,
      averageRating,
      totalReviews,
      reviews,
    });
  } catch (error) {
    console.error("GET reviews error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load reviews." },
      { status: 500 }
    );
  }
}

// POST: Submit a new review
export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const rawBody = await request.text();

    if (rawBody.length > 10_000) {
      return NextResponse.json(
        { success: false, message: "Request body is too large." },
        { status: 413 }
      );
    }

    let body: unknown;

    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON request." },
        { status: 400 }
      );
    }

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid review data." },
        { status: 400 }
      );
    }

    const data = body as Record<string, unknown>;

    const name =
      typeof data.name === "string" ? data.name.trim() : "";

    const comment =
      typeof data.comment === "string" ? data.comment.trim() : "";

    const rating = Number(data.rating);

    if (!name || name.length > 50) {
      return NextResponse.json(
        {
          success: false,
          message: "Name must be between 1 and 50 characters.",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select a rating from 1 to 5.",
        },
        { status: 400 }
      );
    }

    if (comment.length < 5 || comment.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          message: "Review must be between 5 and 1000 characters.",
        },
        { status: 400 }
      );
    }

    const { slug } = await params;

    await connectDB();

    const recipe = await Recipe.findOne({
      slug: slug.toLowerCase(),
      status: "published",
    }).select("_id");

    if (!recipe) {
      return NextResponse.json(
        { success: false, message: "Recipe not found." },
        { status: 404 }
      );
    }

    await Review.create({
      recipeId: recipe._id,
      name,
      rating,
      comment,
      status: "pending",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Thank you! Your review has been submitted.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST review error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to submit your review." },
      { status: 500 }
    );
  }
}
