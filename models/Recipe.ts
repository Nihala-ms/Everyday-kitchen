
import mongoose, { Schema, model, models } from "mongoose";

const IngredientSchema = new Schema(
  {
    amount: {
      type: Number,
      default: null,
    },
    unit: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const InstructionSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const RecipeSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    imageAlt: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    cuisine: {
      type: String,
      default: "Indian",
    },

    prepTime: {
      type: Number,
      required: true,
    },

    cookTime: {
      type: Number,
      required: true,
    },

    totalTime: {
      type: Number,
      required: true,
    },

    servings: {
      type: Number,
      required: true,
      default: 4,
    },

    ingredients: {
      type: [IngredientSchema],
      required: true,
    },

    instructions: {
      type: [InstructionSchema],
      required: true,
    },

    tips: {
      type: [String],
      default: [],
    },

    seo: {
      title: {
        type: String,
        required: true,
      },

      description: {
        type: String,
        required: true,
      },

      keywords: {
        type: [String],
        default: [],
      },
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

RecipeSchema.index({ category: 1, status: 1 });
RecipeSchema.index({ title: "text", description: "text" });

const Recipe =
  models.Recipe || model("Recipe", RecipeSchema);

export default Recipe;
