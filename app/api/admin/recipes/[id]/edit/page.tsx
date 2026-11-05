
"use client";

import { Suspense, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";

function EditRecipeContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRecipe() {
      try {
        const response = await fetch("/api/admin/recipes");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load recipe");
        }

        const recipe = data.recipes.find(
          (item: any) => item._id === id
        );

        if (!recipe) {
          throw new Error("Recipe not found");
        }

        setForm({
          ...recipe,
          seo: recipe.seo || {
            title: "",
            description: "",
            keywords: [],
          },
          ingredients: recipe.ingredients || [],
          instructions: recipe.instructions || [],
          tips: recipe.tips || [],
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Loading failed"
        );
      } finally {
        setLoading(false);
      }
    }

    loadRecipe();
  }, [id]);

  function updateField(name: string, value: any) {
    setForm((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  }

  function updateSEO(name: string, value: any) {
    setForm((prev: any) => ({
      ...prev,
      seo: {
        ...prev.seo,
        [name]: value,
      },
    }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        ...form,
        prepTime: Number(form.prepTime),
        cookTime: Number(form.cookTime),
        totalTime: Number(form.totalTime),
        servings: Number(form.servings),
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
        throw new Error(data.message || "Update failed");
      }

      alert("Recipe updated successfully!");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Update failed"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="p-10">Loading recipe...</p>;
  }

  if (!form) {
    return (
      <p className="p-10 text-red-600">
        {error || "Recipe not found"}
      </p>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-3xl space-y-5 rounded-xl bg-white p-6 shadow"
      >
        <h1 className="text-2xl font-bold">Edit Recipe</h1>

        {error && <p className="text-red-600">{error}</p>}

        {[
          ["title", "Recipe Title"],
          ["slug", "Slug"],
          ["description", "Description"],
          ["image", "Image URL"],
          ["imageAlt", "Image Alt Text"],
          ["category", "Category"],
          ["cuisine", "Cuisine"],
          ["prepTime", "Preparation Time (minutes)"],
          ["cookTime", "Cooking Time (minutes)"],
          ["totalTime", "Total Time (minutes)"],
          ["servings", "Servings"],
        ].map(([name, label]) => (
          <label key={name} className="block">
            <span className="mb-1 block font-medium">
              {label}
            </span>
            <input
              required
              value={form[name] ?? ""}
              onChange={(e) =>
                updateField(name, e.target.value)
              }
              className="w-full rounded-lg border p-3"
            />
          </label>
        ))}

        <div>
          <h2 className="mb-3 text-lg font-bold">
            Ingredients
          </h2>

          {form.ingredients.map((item: any, index: number) => (
            <div
              key={index}
              className="mb-2 grid grid-cols-3 gap-2"
            >
              <input
                type="number"
                step="any"
                placeholder="Amount"
                value={item.amount ?? ""}
                onChange={(e) => {
                  const updated = [...form.ingredients];
                  updated[index] = {
                    ...item,
                    amount:
                      e.target.value === ""
                        ? null
                        : Number(e.target.value),
                  };
                  updateField("ingredients", updated);
                }}
                className="rounded-lg border p-2"
              />

              <input
                placeholder="Unit"
                value={item.unit ?? ""}
                onChange={(e) => {
                  const updated = [...form.ingredients];
                  updated[index] = {
                    ...item,
                    unit: e.target.value,
                  };
                  updateField("ingredients", updated);
                }}
                className="rounded-lg border p-2"
              />

              <input
                required
                placeholder="Ingredient"
                value={item.name ?? ""}
                onChange={(e) => {
                  const updated = [...form.ingredients];
                  updated[index] = {
                    ...item,
                    name: e.target.value,
                  };
                  updateField("ingredients", updated);
                }}
                className="rounded-lg border p-2"
              />
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              updateField("ingredients", [
                ...form.ingredients,
                { amount: null, unit: "", name: "" },
              ])
            }
            className="text-purple-700"
          >
            + Add Ingredient
          </button>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-bold">
            Instructions
          </h2>

          {form.instructions.map(
            (item: any, index: number) => (
              <div key={index} className="mb-3 space-y-2">
                <input
                  required
                  placeholder="Step title"
                  value={item.title ?? ""}
                  onChange={(e) => {
                    const updated = [...form.instructions];
                    updated[index] = {
                      ...item,
                      title: e.target.value,
                    };
                    updateField("instructions", updated);
                  }}
                  className="w-full rounded-lg border p-2"
                />

                <textarea
                  required
                  placeholder="Step description"
                  value={item.description ?? ""}
                  onChange={(e) => {
                    const updated = [...form.instructions];
                    updated[index] = {
                      ...item,
                      description: e.target.value,
                    };
                    updateField("instructions", updated);
                  }}
                  className="w-full rounded-lg border p-2"
                />
              </div>
            )
          )}

          <button
            type="button"
            onClick={() =>
              updateField("instructions", [
                ...form.instructions,
                { title: "", description: "" },
              ])
            }
            className="text-purple-700"
          >
            + Add Step
          </button>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-bold">Tips</h2>

          {form.tips.map((tip: string, index: number) => (
            <input
              key={index}
              value={tip}
              onChange={(e) => {
                const updated = [...form.tips];
                updated[index] = e.target.value;
                updateField("tips", updated);
              }}
              className="mb-2 w-full rounded-lg border p-2"
            />
          ))}

          <button
            type="button"
            onClick={() =>
              updateField("tips", [...form.tips, ""])
            }
            className="text-purple-700"
          >
            + Add Tip
          </button>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-bold">
            SEO Details
          </h2>

          <input
            placeholder="SEO Title"
            value={form.seo.title ?? ""}
            onChange={(e) =>
              updateSEO("title", e.target.value)
            }
            className="mb-2 w-full rounded-lg border p-3"
          />

          <textarea
            placeholder="SEO Description"
            value={form.seo.description ?? ""}
            onChange={(e) =>
              updateSEO("description", e.target.value)
            }
            className="mb-2 w-full rounded-lg border p-3"
          />

          <input
            placeholder="Keywords separated by commas"
            value={(form.seo.keywords || []).join(", ")}
            onChange={(e) =>
              updateSEO(
                "keywords",
                e.target.value
                  .split(",")
                  .map((word: string) => word.trim())
              )
            }
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-purple-700 px-6 py-3 font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="rounded-lg border px-6 py-3"
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}

export default function EditRecipePage() {
  return (
    <Suspense fallback={<p className="p-10">Loading edit page...</p>}>
      <EditRecipeContent />
    </Suspense>
  );
}
