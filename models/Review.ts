
import mongoose, { Schema, model, models } from "mongoose";

const ReviewSchema = new Schema(
  {
    recipeId: {
      type: Schema.Types.ObjectId,
      ref: "Recipe",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ recipeId: 1, status: 1, createdAt: -1 });

const Review = models.Review || model("Review", ReviewSchema);

export default Review;
