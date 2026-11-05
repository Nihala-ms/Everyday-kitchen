
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

interface Ingredient {
  name: string;
  amount?: number | null;
  unit?: string;
}

interface Recipe {
  _id: string;
  title: string;
  slug: string;
  description: string;
  image?: string;
  imageAlt?: string;
  category: string;
  totalTime?: number;
  prepTime?: number;
  cookTime?: number;
  difficulty?: string;
  ingredients: Ingredient[];
  matchedIngredients?: string[];
  matchCount?: number;
  totalSelectedIngredients?: number;
}

function formatTime(minutes?: number) {
  if (!minutes || minutes <= 0) return "Time not specified";

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  if (hours && remaining) return `${hours}h ${remaining} mins`;
  if (hours) return `${hours}h`;

  return `${minutes} mins`;
}

export default function IngredientsFinderPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [results, setResults] = useState<Recipe[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loadingIngredients, setLoadingIngredients] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const fetchIngredients = useCallback(async () => {
    try {
      setLoadingIngredients(true);
      setError("");

      const response = await fetch("/api/recipes", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load ingredients");
      }

      setRecipes(Array.isArray(data.recipes) ? data.recipes : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoadingIngredients(false);
    }
  }, []);

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  const allIngredients = useMemo(() => {
    const ingredientMap = new Map<string, string>();

    recipes.forEach((recipe) => {
      recipe.ingredients?.forEach((ingredient) => {
        const name = ingredient.name?.trim();

        if (name) {
          const key = name.toLowerCase();

          if (!ingredientMap.has(key)) {
            ingredientMap.set(key, name);
          }
        }
      });
    });

    return Array.from(ingredientMap.values()).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [recipes]);

  const filteredIngredients = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return allIngredients;

    return allIngredients.filter((ingredient) =>
      ingredient.toLowerCase().includes(term)
    );
  }, [allIngredients, search]);

  const toggleIngredient = (ingredient: string) => {
    setSelectedIngredients((current) =>
      current.includes(ingredient)
        ? current.filter((item) => item !== ingredient)
        : [...current, ingredient]
    );
  };

  const findRecipes = async () => {
    if (selectedIngredients.length === 0) return;

    try {
      setSearching(true);
      setError("");
      setSearched(false);
      setResults([]);

      const params = new URLSearchParams({
        ingredients: selectedIngredients.join(","),
      });

      const response = await fetch(`/api/recipes?${params.toString()}`, {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to find recipes");
      }

      setResults(Array.isArray(data.recipes) ? data.recipes : []);
      setSearched(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSearching(false);
    }
  };

  const clearAll = () => {
    setSelectedIngredients([]);
    setResults([]);
    setSearch("");
    setSearched(false);
    setError("");
  };

  return (
    <main className="min-h-screen bg-[#fffdf8] text-[#26352c]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#eee9df] bg-[#fffdf8]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-10">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-[#315c43]"
          >
            Everyday<span className="text-[#e8a65b]">.</span>Kitchen
          </Link>

          <nav className="flex items-center gap-5 text-sm font-medium text-[#315c43]">
            <Link href="/" className="hover:text-[#b47a3e]">
              Home
            </Link>
            <Link href="/recipes" className="hover:text-[#b47a3e]">
              Recipes
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#f6f4eb] px-5 py-16 text-center md:py-20">
        <div className="mx-auto max-w-3xl">
          <span className="inline-block rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#b47a3e]">
            🥕 Smart cooking starts here
          </span>

          <h1 className="mt-5 text-4xl leading-tight font-bold text-[#26352c] md:text-5xl">
            Cook With What
            <span className="text-[#315c43]"> You Have</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl leading-8 text-[#777d73]">
            Select the ingredients available in your kitchen.
            We will help you discover delicious recipes you can make
            with what you already have.
          </p>
        </div>
      </section>

      {/* Ingredient Selection */}
      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="rounded-3xl border border-[#eee9df] bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold tracking-widest text-[#b47a3e] uppercase">
                  Your kitchen ingredients
                </p>

                <h2 className="mt-2 text-2xl font-bold text-[#26352c]">
                  What do you have?
                </h2>

                <p className="mt-2 text-sm text-[#777d73]">
                  Choose one or more ingredients below.
                </p>
              </div>

              <span className="rounded-full bg-[#f6f4eb] px-4 py-2 text-sm font-semibold text-[#315c43]">
                {selectedIngredients.length} selected
              </span>
            </div>

            {/* Search ingredients */}
            <div className="mt-7 flex items-center gap-3 rounded-full border border-[#e5e1d7] bg-[#fffdf8] px-5 py-3">
              <span>🔍</span>

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search ingredients..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-[#999]"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-sm font-semibold text-[#315c43]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Ingredient options */}
            {loadingIngredients ? (
              <div className="py-16 text-center text-[#777d73]">
                Loading available ingredients...
              </div>
            ) : error && !searched ? (
              <div className="py-12 text-center">
                <p className="text-[#a34b3e]">{error}</p>

                <button
                  type="button"
                  onClick={fetchIngredients}
                  className="mt-4 rounded-full bg-[#315c43] px-6 py-3 text-sm font-semibold text-white"
                >
                  Try Again
                </button>
              </div>
            ) : allIngredients.length === 0 ? (
              <div className="py-12 text-center text-[#777d73]">
                No ingredients are available yet.
              </div>
            ) : (
              <div className="mt-7 flex flex-wrap gap-3">
                {filteredIngredients.map((ingredient) => {
                  const isSelected =
                    selectedIngredients.includes(ingredient);

                  return (
                    <button
                      type="button"
                      key={ingredient}
                      onClick={() => toggleIngredient(ingredient)}
                      aria-pressed={isSelected}
                      className={`rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                        isSelected
                          ? "border-[#315c43] bg-[#315c43] text-white"
                          : "border-[#e5e1d7] bg-white text-[#315c43] hover:border-[#315c43] hover:bg-[#f6f4eb]"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {ingredient}
                    </button>
                  );
                })}

                {filteredIngredients.length === 0 && (
                  <p className="py-5 text-sm text-[#777d73]">
                    No ingredients match your search.
                  </p>
                )}
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3 border-t border-[#eee9df] pt-6">
              <button
                type="button"
                onClick={findRecipes}
                disabled={selectedIngredients.length === 0 || searching}
                className="rounded-full bg-[#315c43] px-7 py-3.5 font-semibold text-white transition hover:bg-[#244630] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {searching ? "Finding Recipes..." : "Find Recipes →"}
              </button>

              <button
                type="button"
                onClick={clearAll}
                className="rounded-full border border-[#dcded4] px-7 py-3.5 font-semibold text-[#315c43] transition hover:bg-[#f6f4eb]"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Selected ingredients */}
          <aside className="h-fit rounded-3xl bg-[#f6f4eb] p-6">
            <h3 className="text-xl font-bold text-[#315c43]">
              Your selection
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#777d73]">
              Ingredients you selected for your recipe search.
            </p>

            {selectedIngredients.length === 0 ? (
              <p className="mt-6 rounded-2xl bg-white p-4 text-sm text-[#888d82]">
                Your selected ingredients will appear here.
              </p>
            ) : (
              <div className="mt-5 flex flex-wrap gap-2">
                {selectedIngredients.map((ingredient) => (
                  <span
                    key={ingredient}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm text-[#315c43]"
                  >
                    {ingredient}

                    <button
                      type="button"
                      onClick={() => toggleIngredient(ingredient)}
                      aria-label={`Remove ${ingredient}`}
                      className="font-bold text-[#b47a3e]"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <p className="mt-6 text-xs leading-5 text-[#888d82]">
              Tip: Select more ingredients to discover recipes that
              use more of what is already in your kitchen.
            </p>
          </aside>
        </div>
      </section>

      {/* Results */}
      {searched && (
        <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-10">
          <div className="mb-8">
            <p className="font-semibold tracking-widest text-[#b47a3e] uppercase">
              Recipe suggestions
            </p>

            <h2 className="mt-3 text-3xl font-bold text-[#26352c]">
              {results.length > 0
                ? `${results.length} recipes you can try`
                : "No matching recipes found"}
            </h2>

            <p className="mt-3 text-[#777d73]">
              Based on your selected kitchen ingredients.
            </p>
          </div>

          {error && (
            <p className="mb-5 text-sm text-[#a34b3e]">{error}</p>
          )}

          {results.length > 0 ? (
            <div className="grid items-stretch gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((recipe) => {
                const recipeTime =
                  recipe.totalTime ||
                  ((recipe.prepTime || 0) + (recipe.cookTime || 0));

                return (
                  <article
                    key={recipe._id}
                    className="flex h-full flex-col overflow-hidden rounded-3xl border border-[#eee9df] bg-white transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div
                      className="relative h-56 shrink-0 bg-[#f6f4eb] bg-cover bg-center"
                      style={{
                        backgroundImage: recipe.image
                          ? `url('${recipe.image.replace(/'/g, "%27")}')`
                          : "none",
                      }}
                      role="img"
                      aria-label={recipe.imageAlt || recipe.title}
                    >
                      <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#315c43]">
                        {recipe.category}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="line-clamp-2 min-h-[56px] text-xl font-bold text-[#26352c]">
                        {recipe.title}
                      </h3>

                      <p className="mt-2 line-clamp-3 min-h-[72px] text-sm leading-6 text-[#777d73]">
                        {recipe.description}
                      </p>

                      <div className="mt-4 rounded-2xl bg-[#f6f4eb] p-3">
                        <p className="text-xs font-semibold text-[#315c43]">
                          Ingredients matched
                        </p>

                        <p className="mt-1 text-sm text-[#777d73]">
                          {recipe.matchCount ?? 0} of{" "}
                          {selectedIngredients.length} selected
                        </p>

                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {(recipe.matchedIngredients || []).map(
                            (ingredient) => (
                              <span
                                key={ingredient}
                                className="rounded-full bg-white px-2.5 py-1 text-xs text-[#315c43]"
                              >
                                ✓ {ingredient}
                              </span>
                            )
                          )}
                        </div>
                      </div>

                      <div className="mt-auto flex items-center justify-between border-t border-[#eee9df] pt-4 text-sm text-[#777d73]">
                        <span>◷ {formatTime(recipeTime)}</span>
                        <span>{recipe.difficulty || "Homemade"}</span>
                      </div>

                      <Link
                        href={`/recipes/${recipe.slug}`}
                        className="mt-5 block rounded-full bg-[#315c43] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#244630]"
                      >
                        View Recipe →
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl bg-[#f6f4eb] px-5 py-14 text-center">
              <p className="text-4xl">🥕</p>

              <h3 className="mt-4 text-xl font-bold text-[#315c43]">
                Try selecting more ingredients
              </h3>

              <p className="mt-2 text-[#777d73]">
                We couldn't find published recipes containing your
                selected ingredients. Try a different combination.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Footer */}
      <footer className="bg-[#243b2c] px-5 py-10 text-center text-white">
        <Link href="/" className="text-2xl font-bold">
          Everyday<span className="text-[#e8a65b]">.</span>Kitchen
        </Link>

        <p className="mt-3 text-sm text-white/65">
          Simple ingredients. Delicious memories.
        </p>

        <div className="mt-6 flex justify-center gap-6 text-sm text-white/75">
          <Link href="/recipes" className="hover:text-white">
            Recipes
          </Link>
          <Link href="/" className="hover:text-white">
            Home
          </Link>
        </div>

        <p className="mt-8 text-xs text-white/50">
          © 2026 Everyday Kitchen. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
