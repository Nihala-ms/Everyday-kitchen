"use client";

import { useEffect, useState } from "react";
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

interface Recipe {
  _id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  imageAlt: string;
  category: string;
  cuisine: string;
  prepTime: number;
  cookTime: number;
  totalTime: number;
  servings: number;
  ingredients: Ingredient[];
  instructions: Instruction[];
  tips: string[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

interface EditRecipeClientProps {
  id: string;
}

export default function EditRecipeClient({ id }: EditRecipeClientProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    image: "",
    imageAlt: "",
    category: "",
    cuisine: "Indian",
    prepTime: "",
    cookTime: "",
    servings: "4",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [tips, setTips] = useState<string[]>([]);

  // FETCH EXISTING RECIPE
  useEffect(() => {
    if (!id) {
      setError("Recipe ID is missing");
      setLoading(false);
      return;
    }

    async function fetchRecipe() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/admin/recipes", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load recipes");
        }

        const recipe: Recipe | undefined = data.recipes.find(
          (item: Recipe) => item._id === id
        );

        if (!recipe) {
          throw new Error("Recipe not found");
        }

        setForm({
          title: recipe.title || "",
          slug: recipe.slug || "",
          description: recipe.description || "",
          image: recipe.image || "",
          imageAlt: recipe.imageAlt || "",
          category: recipe.category || "",
          cuisine: recipe.cuisine || "Indian",
          prepTime: String(recipe.prepTime ?? 0),
          cookTime: String(recipe.cookTime ?? 0),
          servings: String(recipe.servings ?? 4),
          seoTitle: recipe.seo?.title || "",
          seoDescription: recipe.seo?.description || "",
          seoKeywords: recipe.seo?.keywords?.join(", ") || "",
        });

        setIngredients(
          recipe.ingredients?.length
            ? recipe.ingredients.map((item) => ({
                amount: item.amount ?? null,
                unit: item.unit || "",
                name: item.name || "",
              }))
            : [{ amount: null, unit: "", name: "" }]
        );

        setInstructions(
          recipe.instructions?.length
            ? recipe.instructions
            : [{ title: "", description: "" }]
        );

        setTips(recipe.tips?.length ? recipe.tips : [""]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchRecipe();
  }, [id]);

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      const prepTime = Number(form.prepTime);
      const cookTime = Number(form.cookTime);
      const servings = Number(form.servings);

      if (!form.title.trim() || !form.slug.trim()) {
        throw new Error("Recipe title and slug are required");
      }

      if (
        !Number.isFinite(prepTime) ||
        prepTime < 0 ||
        !Number.isFinite(cookTime) ||
        cookTime < 0 ||
        !Number.isFinite(servings) ||
        servings < 1
      ) {
        throw new Error("Please enter valid cooking times and servings");
      }

      const validIngredients = ingredients.filter(
        (item) => item.name.trim() !== ""
      );

      const validInstructions = instructions.filter(
        (item) =>
          item.title.trim() !== "" &&
          item.description.trim() !== ""
      );

      if (validIngredients.length === 0) {
        throw new Error("Please add at least one ingredient");
      }

      if (validInstructions.length === 0) {
        throw new Error("Please add at least one cooking instruction");
      }

      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim().toLowerCase(),
        description: form.description.trim(),
        image: form.image.trim(),
        imageAlt: form.imageAlt.trim(),
        category: form.category,
        cuisine: form.cuisine.trim(),
        prepTime,
        cookTime,
        totalTime: prepTime + cookTime,
        servings,
        ingredients: validIngredients,
        instructions: validInstructions,
        tips: tips.filter((tip) => tip.trim() !== ""),
        seo: {
          title: form.seoTitle.trim(),
          description: form.seoDescription.trim(),
          keywords: form.seoKeywords
            .split(",")
            .map((keyword) => keyword.trim())
            .filter(Boolean),
        },
      };

      const response = await fetch(`/api/admin/recipes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update recipe");
      }

      alert("Recipe updated successfully!");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-100";

  const labelClass = "mb-2 block text-sm font-semibold text-gray-700";

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="font-medium text-gray-600">
          Loading recipe details...
        </p>
      </main>
    );
  }

  if (error && !form.title) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">
            Unable to open recipe
          </h1>

          <p className="mt-3 text-sm text-red-600">{error}</p>

          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="mt-5 rounded-lg bg-purple-700 px-5 py-3 font-semibold text-white"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    );
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
            Edit Recipe
          </h1>

          <p className="mt-2 text-gray-600">
            Update your recipe details, ingredients and SEO information.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-7">

          {/* BASIC DETAILS */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold text-gray-900">
              Basic Details
            </h2>

            <div className="space-y-5">
              <div>
                <label className={labelClass}>Recipe Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Recipe Slug</label>
                <input
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Used in the recipe URL. Changing it changes the public URL.
                </p>
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className={inputClass}
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Image URL</label>
                <input
                  name="image"
                  type="url"
                  value={form.image}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Image Alt Text</label>
                <input
                  name="imageAlt"
                  value={form.imageAlt}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Category</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  >
                    <option value="">Select category</option>

                    {[
                      "Breakfast",
                      "Lunch",
                      "Dinner",
                      "Snacks",
                      "Desserts",
                      "Drinks",
                    ].map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}

                    {form.category &&
                      ![
                        "Breakfast",
                        "Lunch",
                        "Dinner",
                        "Snacks",
                        "Desserts",
                        "Drinks",
                      ].includes(form.category) && (
                        <option value={form.category}>
                          {form.category}
                        </option>
                      )}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Cuisine</label>
                  <input
                    name="cuisine"
                    value={form.cuisine}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <div>
                  <label className={labelClass}>Prep Time (min)</label>
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
                  <label className={labelClass}>Cook Time (min)</label>
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
                  <label className={labelClass}>Servings</label>
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

              <p className="text-sm text-gray-500">
                Total cooking time is calculated automatically.
              </p>
            </div>
          </section>

          {/* INGREDIENTS */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold text-gray-900">
              Ingredients
            </h2>

            {ingredients.map((item, index) => (
              <div
                key={index}
                className="mb-4 grid gap-3 sm:grid-cols-12"
              >
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Amount"
                  value={item.amount ?? ""}
                  onChange={(e) =>
                    updateIngredient(index, "amount", e.target.value)
                  }
                  className={`${inputClass} sm:col-span-2`}
                />

                <input
                  placeholder="Unit"
                  value={item.unit}
                  onChange={(e) =>
                    updateIngredient(index, "unit", e.target.value)
                  }
                  className={`${inputClass} sm:col-span-3`}
                />

                <input
                  placeholder="Ingredient name"
                  value={item.name}
                  onChange={(e) =>
                    updateIngredient(index, "name", e.target.value)
                  }
                  className={`${inputClass} sm:col-span-5`}
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setIngredients((previous) =>
                      previous.filter((_, i) => i !== index)
                    )
                  }
                  className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 sm:col-span-2"
                >
                  Remove
                </button>
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
              className="font-semibold text-purple-700 hover:underline"
            >
              + Add Ingredient
            </button>
          </section>

          {/* INSTRUCTIONS */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold text-gray-900">
              Cooking Instructions
            </h2>

            {instructions.map((item, index) => (
              <div
                key={index}
                className="mb-5 rounded-xl border border-gray-200 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">
                    Step {index + 1}
                  </h3>

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
                    updateInstruction(index, "title", e.target.value)
                  }
                  className={`${inputClass} mb-3`}
                  required
                />

                <textarea
                  placeholder="Describe the cooking step..."
                  value={item.description}
                  onChange={(e) =>
                    updateInstruction(index, "description", e.target.value)
                  }
                  className={inputClass}
                  rows={3}
                  required
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
              className="font-semibold text-purple-700 hover:underline"
            >
              + Add Instruction
            </button>
          </section>

          {/* TIPS */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold text-gray-900">
              Cooking Tips
            </h2>

            {tips.map((tip, index) => (
              <div key={index} className="mb-3 flex gap-3">
                <input
                  value={tip}
                  onChange={(e) =>
                    setTips((previous) =>
                      previous.map((item, i) =>
                        i === index ? e.target.value : item
                      )
                    )
                  }
                  placeholder="Enter a cooking tip"
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
              className="font-semibold text-purple-700 hover:underline"
            >
              + Add Tip
            </button>
          </section>

          {/* SEO */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold text-gray-900">
              SEO Details
            </h2>

            <div className="space-y-5">
              <div>
                <label className={labelClass}>SEO Title</label>
                <input
                  name="seoTitle"
                  value={form.seoTitle}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>SEO Description</label>
                <textarea
                  name="seoDescription"
                  value={form.seoDescription}
                  onChange={handleChange}
                  className={inputClass}
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>SEO Keywords</label>
                <input
                  name="seoKeywords"
                  value={form.seoKeywords}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Kerala recipe, homemade food, easy recipe"
                />
              </div>
            </div>
          </section>

          {/* ERROR */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex flex-wrap gap-3 pb-8">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-purple-700 px-7 py-3 font-semibold text-white hover:bg-purple-800 disabled:opacity-50"
            >
              {saving ? "Updating Recipe..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="rounded-xl border border-gray-300 bg-white px-7 py-3 font-semibold text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}