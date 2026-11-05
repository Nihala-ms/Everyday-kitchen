
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Ingredient {
  amount: number | null;
  unit: string;
  name: string;
}

interface Instruction {
  title: string;
  description: string;
}

const categories = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snacks",
  "Desserts",
  "Drinks",
];

const inputClass =
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-100";

const labelClass =
  "mb-2 block text-sm font-semibold text-gray-700";

export default function NewRecipePage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    image: "",
    imageAlt: "",
    category: "",
    cuisine: "Indian",
    prepTime: "10",
    cookTime: "20",
    servings: "4",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { amount: null, unit: "", name: "" },
  ]);

  const [instructions, setInstructions] = useState<Instruction[]>([
    { title: "", description: "" },
  ]);

  const [tips, setTips] = useState<string[]>([""]);

  function createSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (name === "title") {
      if (!slugManuallyEdited) {
        setForm((previous) => ({
          ...previous,
          title: value,
          slug: createSlug(value),
          seoTitle: previous.seoTitle || value,
        }));
      }
    }

    if (name === "image") {
      setImageError(false);
    }
  }

  function updateIngredient(
    index: number,
    field: keyof Ingredient,
    value: string
  ) {
    setIngredients((previous) =>
      previous.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]:
                field === "amount"
                  ? value === ""
                    ? null
                    : Number(value)
                  : value,
            }
          : item
      )
    );
  }

  function updateInstruction(
    index: number,
    field: keyof Instruction,
    value: string
  ) {
    setInstructions((previous) =>
      previous.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  }

  function updateTip(index: number, value: string) {
    setTips((previous) =>
      previous.map((tip, i) => (i === index ? value : tip))
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    if (!form.title.trim() || !form.slug.trim()) {
      setError("Recipe title and slug are required.");
      return;
    }

    if (!form.category) {
      setError("Please select a recipe category.");
      return;
    }

    if (!form.image.trim() || !form.imageAlt.trim()) {
      setError("Please provide an image URL and image alt text.");
      return;
    }

    const prepTime = Number(form.prepTime);
    const cookTime = Number(form.cookTime);
    const servings = Number(form.servings);

    if (
      !Number.isFinite(prepTime) ||
      !Number.isFinite(cookTime) ||
      prepTime < 0 ||
      cookTime < 0
    ) {
      setError("Preparation and cooking times must be valid numbers.");
      return;
    }

    if (!Number.isInteger(servings) || servings < 1) {
      setError("Servings must be at least 1.");
      return;
    }

    const validIngredients = ingredients.filter(
      (item) => item.name.trim()
    );

    const validInstructions = instructions.filter(
      (item) => item.title.trim() && item.description.trim()
    );

    if (validIngredients.length === 0) {
      setError("Please add at least one ingredient.");
      return;
    }

    if (validInstructions.length === 0) {
      setError("Please add at least one cooking instruction.");
      return;
    }

    if (
      !form.seoTitle.trim() ||
      !form.seoDescription.trim()
    ) {
      setError("SEO title and SEO description are required.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim().toLowerCase(),
      description: form.description.trim(),
      image: form.image.trim(),
      imageAlt: form.imageAlt.trim(),
      category: form.category,
      cuisine: form.cuisine.trim() || "Indian",
      prepTime,
      cookTime,
      totalTime: prepTime + cookTime,
      servings,
      ingredients: validIngredients,
      instructions: validInstructions,
      tips: tips.filter((tip) => tip.trim()),
      seo: {
        title: form.seoTitle.trim(),
        description: form.seoDescription.trim(),
        keywords: form.seoKeywords
          .split(",")
          .map((keyword) => keyword.trim())
          .filter(Boolean),
      },
    };

    try {
      setSaving(true);

      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to create recipe."
        );
      }

      alert("Recipe saved successfully as draft!");

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl">

        {/* HEADER */}
        <header className="mb-8">
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="mb-5 text-sm font-semibold text-purple-700 hover:underline"
          >
            ← Back to Dashboard
          </button>

          <p className="text-sm font-semibold uppercase tracking-wider text-purple-700">
            Everyday Kitchen
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Add New Recipe
          </h1>

          <p className="mt-2 text-gray-600">
            Create a delicious recipe for your readers.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-7">

          {/* BASIC DETAILS */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold text-gray-900">
              01. Basic Details
            </h2>

            <div className="space-y-5">
              <div>
                <label className={labelClass}>
                  Recipe Title *
                </label>

                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Example: Kerala Vegetable Pulao"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>
                  URL Slug *
                </label>

                <input
                  name="slug"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugManuallyEdited(true);
                    handleChange(e);
                  }}
                  placeholder="kerala-vegetable-pulao"
                  className={inputClass}
                  required
                />

                <p className="mt-2 text-xs text-gray-500">
                  Recipe URL: /recipes/{form.slug || "your-recipe-slug"}
                </p>
              </div>

              <div>
                <label className={labelClass}>
                  Recipe Description *
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Write a short and useful description..."
                  rows={4}
                  className={inputClass}
                  required
                />
                <p className="mt-1 text-right text-xs text-gray-400">
                  {form.description.length} characters
                </p>
              </div>

              <div>
                <label className={labelClass}>
                  Recipe Image URL *
                </label>

                <input
                  name="image"
                  type="url"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="https://example.com/recipe-image.jpg"
                  className={inputClass}
                  required
                />
              </div>

              {form.image && !imageError && (
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <p className="bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600">
                    IMAGE PREVIEW
                  </p>

                  <img
                    src={form.image}
                    alt="Recipe preview"
                    onError={() => setImageError(true)}
                    className="h-64 w-full object-cover"
                  />
                </div>
              )}

              {imageError && (
                <p className="text-sm text-red-600">
                  Image could not be loaded. Check the URL.
                </p>
              )}

              <div>
                <label className={labelClass}>
                  Image Alt Text *
                </label>

                <input
                  name="imageAlt"
                  value={form.imageAlt}
                  onChange={handleChange}
                  placeholder="Fresh homemade Kerala vegetable pulao"
                  className={inputClass}
                  required
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    Category *
                  </label>

                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  >
                    <option value="">Select category</option>

                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Cuisine
                  </label>

                  <input
                    name="cuisine"
                    value={form.cuisine}
                    onChange={handleChange}
                    placeholder="Indian, Kerala, Chinese..."
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* TIME AND SERVINGS */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold text-gray-900">
              02. Time & Servings
            </h2>

            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <label className={labelClass}>
                  Prep Time (min) *
                </label>

                <input
                  name="prepTime"
                  type="number"
                  min="0"
                  value={form.prepTime}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>
                  Cook Time (min) *
                </label>

                <input
                  name="cookTime"
                  type="number"
                  min="0"
                  value={form.cookTime}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>
                  Servings *
                </label>

                <input
                  name="servings"
                  type="number"
                  min="1"
                  value={form.servings}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-purple-50 p-4">
              <p className="text-sm text-purple-800">
                Total Cooking Time
              </p>

              <p className="mt-1 text-2xl font-bold text-purple-900">
                {(Number(form.prepTime) || 0) +
                  (Number(form.cookTime) || 0)}{" "}
                minutes
              </p>
            </div>
          </section>

          {/* INGREDIENTS */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-xl font-bold text-gray-900">
              03. Ingredients
            </h2>

            <p className="mb-5 text-sm text-gray-500">
              Add all ingredients with their quantities and units.
            </p>

            {ingredients.map((item, index) => (
              <div
                key={index}
                className="mb-4 rounded-xl border border-gray-200 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-semibold text-gray-700">
                    Ingredient {index + 1}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setIngredients((previous) =>
                        previous.filter((_, i) => i !== index)
                      )
                    }
                    className="text-sm font-semibold text-red-600"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Amount"
                    value={item.amount ?? ""}
                    onChange={(e) =>
                      updateIngredient(
                        index,
                        "amount",
                        e.target.value
                      )
                    }
                    className={inputClass}
                  />

                  <input
                    placeholder="Unit (cup, tbsp, g)"
                    value={item.unit}
                    onChange={(e) =>
                      updateIngredient(
                        index,
                        "unit",
                        e.target.value
                      )
                    }
                    className={inputClass}
                  />

                  <input
                    placeholder="Ingredient name"
                    value={item.name}
                    onChange={(e) =>
                      updateIngredient(
                        index,
                        "name",
                        e.target.value
                      )
                    }
                    className={inputClass}
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                setIngredients((previous) => [
                  ...previous,
                  { amount: null, unit: "", name: "" },
                ])
              }
              className="rounded-lg bg-purple-50 px-4 py-3 font-semibold text-purple-700 hover:bg-purple-100"
            >
              + Add Ingredient
            </button>
          </section>

          {/* INSTRUCTIONS */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-xl font-bold text-gray-900">
              04. Cooking Instructions
            </h2>

            <p className="mb-5 text-sm text-gray-500">
              Explain the cooking process step by step.
            </p>

            {instructions.map((item, index) => (
              <div
                key={index}
                className="mb-5 rounded-xl border border-gray-200 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-semibold text-gray-800">
                    Step {index + 1}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setInstructions((previous) =>
                        previous.filter((_, i) => i !== index)
                      )
                    }
                    className="text-sm font-semibold text-red-600"
                  >
                    Remove
                  </button>
                </div>

                <input
                  placeholder="Step title"
                  value={item.title}
                  onChange={(e) =>
                    updateInstruction(
                      index,
                      "title",
                      e.target.value
                    )
                  }
                  className={`${inputClass} mb-3`}
                />

                <textarea
                  placeholder="Describe this cooking step..."
                  value={item.description}
                  onChange={(e) =>
                    updateInstruction(
                      index,
                      "description",
                      e.target.value
                    )
                  }
                  rows={3}
                  className={inputClass}
                />
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                setInstructions((previous) => [
                  ...previous,
                  { title: "", description: "" },
                ])
              }
              className="rounded-lg bg-purple-50 px-4 py-3 font-semibold text-purple-700 hover:bg-purple-100"
            >
              + Add Cooking Step
            </button>
          </section>

          {/* TIPS */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-xl font-bold text-gray-900">
              05. Cooking Tips
            </h2>

            <p className="mb-5 text-sm text-gray-500">
              Add useful tips to help readers prepare the recipe.
            </p>

            {tips.map((tip, index) => (
              <div key={index} className="mb-3 flex gap-3">
                <input
                  value={tip}
                  onChange={(e) =>
                    updateTip(index, e.target.value)
                  }
                  placeholder={`Cooking tip ${index + 1}`}
                  className={inputClass}
                />

                <button
                  type="button"
                  onClick={() =>
                    setTips((previous) =>
                      previous.filter((_, i) => i !== index)
                    )
                  }
                  className="text-sm font-semibold text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setTips((previous) => [...previous, ""])}
              className="rounded-lg bg-purple-50 px-4 py-3 font-semibold text-purple-700 hover:bg-purple-100"
            >
              + Add Tip
            </button>
          </section>

          {/* SEO */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-xl font-bold text-gray-900">
              06. SEO Settings
            </h2>

            <p className="mb-5 text-sm text-gray-500">
              Optimize your recipe for search engines.
            </p>

            <div className="space-y-5">
              <div>
                <label className={labelClass}>
                  SEO Title *
                </label>

                <input
                  name="seoTitle"
                  value={form.seoTitle}
                  onChange={handleChange}
                  placeholder="Easy Kerala Vegetable Pulao Recipe"
                  className={inputClass}
                  required
                />

                <p className="mt-1 text-right text-xs text-gray-400">
                  {form.seoTitle.length} characters
                </p>
              </div>

              <div>
                <label className={labelClass}>
                  SEO Description *
                </label>

                <textarea
                  name="seoDescription"
                  value={form.seoDescription}
                  onChange={handleChange}
                  placeholder="Write a search-friendly description..."
                  rows={3}
                  className={inputClass}
                  required
                />

                <p className="mt-1 text-right text-xs text-gray-400">
                  {form.seoDescription.length} characters
                </p>
              </div>

              <div>
                <label className={labelClass}>
                  SEO Keywords
                </label>

                <input
                  name="seoKeywords"
                  value={form.seoKeywords}
                  onChange={handleChange}
                  placeholder="Kerala recipe, vegetable pulao, easy lunch"
                  className={inputClass}
                />

                <p className="mt-2 text-xs text-gray-500">
                  Separate keywords using commas.
                </p>
              </div>
            </div>
          </section>

          {/* ERROR */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* SUBMIT */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="font-bold text-gray-900">
                Ready to save?
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Your new recipe will be saved as a draft.
                You can publish it from the admin dashboard.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-purple-700 px-7 py-3 font-semibold text-white transition hover:bg-purple-800 disabled:opacity-50"
              >
                {saving ? "Saving Recipe..." : "Save as Draft"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/admin")}
                className="rounded-xl border border-gray-300 bg-white px-7 py-3 font-semibold text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </section>
        </form>
      </div>
    </main>
  );
}
