"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

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
  createdAt?: string;
}

interface RecipesClientProps {
  initialRecipes: Recipe[];
}

type SortOption = "latest" | "oldest" | "title";

const categories = [
  "All",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snacks",
  "Desserts",
  "Drinks",
];

export default function RecipesClient({
  initialRecipes,
}: RecipesClientProps) {
  const [recipes] = useState<Recipe[]>(initialRecipes);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [sortBy, setSortBy] = useState<SortOption>("latest");

  const cuisines = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(recipes.map((recipe) => recipe.cuisine).filter(Boolean))
      ).sort(),
    ];
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    let result = [...recipes];
    const searchValue = search.trim().toLowerCase();

    if (searchValue) {
      result = result.filter((recipe) => {
        return (
          recipe.title?.toLowerCase().includes(searchValue) ||
          recipe.description?.toLowerCase().includes(searchValue) ||
          recipe.category?.toLowerCase().includes(searchValue) ||
          recipe.cuisine?.toLowerCase().includes(searchValue)
        );
      });
    }

    if (selectedCategory !== "All") {
      result = result.filter(
        (recipe) => recipe.category === selectedCategory
      );
    }

    if (selectedCuisine !== "All") {
      result = result.filter(
        (recipe) => recipe.cuisine === selectedCuisine
      );
    }

    if (sortBy === "latest") {
      result.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
    }

    if (sortBy === "oldest") {
      result.sort(
        (a, b) =>
          new Date(a.createdAt || 0).getTime() -
          new Date(b.createdAt || 0).getTime()
      );
    }

    if (sortBy === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [recipes, search, selectedCategory, selectedCuisine, sortBy]);

  function clearFilters() {
    setSearch("");
    setSelectedCategory("All");
    setSelectedCuisine("All");
    setSortBy("latest");
  }

  return (
    <main className="min-h-screen bg-[#fffdf8] text-[#26352c]">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-[#dce5d9] bg-[#e8eee5]/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-10">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-[#315c43] transition hover:text-[#244630] sm:text-2xl"
          >
            Everyday<span className="text-[#e8a65b]">.</span>Kitchen
          </Link>

          <nav className="flex items-center gap-5 text-sm font-semibold text-[#315c43] sm:gap-8">
            <Link href="/" className="transition hover:text-[#b47a3e]">
              Home
            </Link>

            <Link
              href="/recipes"
              aria-current="page"
              className="border-b-2 border-[#b47a3e] pb-1 text-[#a76d34]"
            >
              Recipes
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#f2f0e6] px-4 py-16 text-center sm:py-24">
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[#dce5d9]/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-[#f2dfc7]/60 blur-3xl" />

        <div className="relative mx-auto max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#b47a3e]">
            Welcome to Everyday Kitchen
          </p>

          <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight text-[#26352c] sm:text-5xl lg:text-6xl">
            Explore Our Recipes
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-[#687268] sm:text-lg">
            Discover delicious homemade recipes, from traditional Kerala
            dishes to simple everyday meals made with love.
          </p>

          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#d9dfd3] bg-white/80 px-5 py-2.5 text-sm font-semibold text-[#315c43]">
            <span className="h-2 w-2 rounded-full bg-[#b47a3e]" />
            {recipes.length} recipes to explore
          </div>

          <div className="mx-auto mt-9 h-1 w-16 rounded-full bg-[#b47a3e]" />
        </div>
      </section>

      {/* SEARCH AND FILTERS */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
        <div className="rounded-3xl border border-[#e8e5d9] bg-white p-5 shadow-[0_8px_30px_rgba(38,53,44,0.05)] sm:p-8">
          <div className="mb-7">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b47a3e]">
              Find your next favourite
            </p>

            <h2 className="mt-2 font-serif text-2xl font-semibold text-[#26352c] sm:text-3xl">
              Find the perfect recipe
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {/* SEARCH */}
            <div>
              <label
                htmlFor="recipe-search"
                className="mb-2 block text-sm font-semibold text-[#35483a]"
              >
                Search Recipes
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[#8b978b]">
                  ⌕
                </span>

                <input
                  id="recipe-search"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search recipes..."
                  className="w-full rounded-xl border border-[#e2e5dc] bg-[#fffdf8] py-3.5 pl-11 pr-4 text-sm text-[#26352c] outline-none transition placeholder:text-[#9aa198] focus:border-[#315c43] focus:ring-2 focus:ring-[#315c43]/10"
                />
              </div>
            </div>

            {/* CUISINE */}
            <div>
              <label
                htmlFor="cuisine-filter"
                className="mb-2 block text-sm font-semibold text-[#35483a]"
              >
                Cuisine
              </label>

              <select
                id="cuisine-filter"
                value={selectedCuisine}
                onChange={(e) => setSelectedCuisine(e.target.value)}
                className="w-full rounded-xl border border-[#e2e5dc] bg-[#fffdf8] px-4 py-3.5 text-sm text-[#35483a] outline-none focus:border-[#315c43] focus:ring-2 focus:ring-[#315c43]/10"
              >
                {cuisines.map((cuisine) => (
                  <option key={cuisine} value={cuisine}>
                    {cuisine === "All" ? "All Cuisines" : cuisine}
                  </option>
                ))}
              </select>
            </div>

            {/* SORT */}
            <div>
              <label
                htmlFor="sort-recipes"
                className="mb-2 block text-sm font-semibold text-[#35483a]"
              >
                Sort Recipes
              </label>

              <select
                id="sort-recipes"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full rounded-xl border border-[#e2e5dc] bg-[#fffdf8] px-4 py-3.5 text-sm text-[#35483a] outline-none focus:border-[#315c43] focus:ring-2 focus:ring-[#315c43]/10"
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* CATEGORY FILTER */}
          <div className="mt-8 border-t border-[#eeece4] pt-6">
            <p className="mb-4 text-sm font-semibold text-[#35483a]">
              Browse by Category
            </p>

            <div className="flex flex-wrap gap-2.5">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  aria-pressed={selectedCategory === category}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                    selectedCategory === category
                      ? "bg-[#315c43] text-white shadow-sm"
                      : "border border-[#e3e8df] bg-[#f6f7f1] text-[#526353] hover:border-[#315c43] hover:bg-[#e9eee5]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* FILTER RESULTS */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#eeece4] pt-5">
            <p className="text-sm text-[#788077]">
              Showing{" "}
              <span className="font-bold text-[#26352c]">
                {filteredRecipes.length}
              </span>{" "}
              of {recipes.length} recipes
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-semibold text-[#a76d34] transition hover:text-[#315c43] hover:underline"
            >
              Clear all filters
            </button>
          </div>
        </div>
      </section>

      {/* RECIPE GRID */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-10">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b47a3e]">
              Made for your table
            </p>

            <h2 className="mt-2 font-serif text-3xl font-semibold text-[#26352c]">
              All Recipes
            </h2>
          </div>

          <p className="text-sm text-[#7b857a]">
            {filteredRecipes.length} results
          </p>
        </div>

        {filteredRecipes.length === 0 ? (
          <div className="rounded-3xl border border-[#e8e5d9] bg-white px-5 py-16 text-center">
            <div className="text-5xl">🍽️</div>

            <h2 className="mt-5 font-serif text-2xl font-semibold text-[#26352c]">
              No recipes found
            </h2>

            <p className="mt-3 text-sm text-[#7b857a]">
              Try another search or change your filters.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 rounded-full bg-[#315c43] px-7 py-3 font-semibold text-white transition hover:bg-[#243b2c]"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid items-stretch gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRecipes.map((recipe) => (
              <article
                key={recipe._id}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#e9e6dc] bg-white shadow-[0_5px_20px_rgba(38,53,44,0.04)] transition duration-300 hover:-translate-y-1 hover:border-[#cbd7c9] hover:shadow-[0_14px_35px_rgba(38,53,44,0.10)]"
              >
                <Link
                  href={`/recipes/${recipe.slug}`}
                  className="relative block h-60 shrink-0 overflow-hidden bg-[#f0eee4]"
                >
                  {recipe.image ? (
                    <img
                      src={recipe.image}
                      alt={recipe.imageAlt || recipe.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-5xl">
                      🍲
                    </div>
                  )}

                  <span className="absolute left-4 top-4 rounded-full border border-white/50 bg-[#fffdf8]/95 px-4 py-2 text-xs font-bold text-[#315c43] shadow-sm">
                    {recipe.category}
                  </span>
                </Link>

                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-medium text-[#858d82]">
                    <span>{recipe.cuisine || "Indian"}</span>
                    <span className="text-[#c18a4d]">•</span>
                    <span>
                      {recipe.totalTime ??
                        recipe.prepTime + recipe.cookTime}{" "}
                      min
                    </span>
                  </div>

                  <Link href={`/recipes/${recipe.slug}`}>
                    <h3 className="line-clamp-2 min-h-[64px] font-serif text-2xl font-semibold leading-snug text-[#26352c] transition group-hover:text-[#a76d34]">
                      {recipe.title}
                    </h3>
                  </Link>

                  <p className="mt-3 min-h-[56px] line-clamp-2 text-sm leading-7 text-[#737d72]">
                    {recipe.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between border-t border-[#eeece4] pt-4">
                    <span className="text-xs font-medium text-[#858d82]">
                      {recipe.servings} servings
                    </span>

                    <Link
                      href={`/recipes/${recipe.slug}`}
                      className="text-sm font-bold text-[#315c43] transition hover:text-[#b47a3e]"
                    >
                      View Recipe <span className="ml-1">→</span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="bg-[#243b2c] px-4 py-10 text-white sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
          <div>
            <Link href="/" className="text-xl font-bold tracking-tight">
              Everyday<span className="text-[#e8a65b]">.</span>Kitchen
            </Link>

            <p className="mt-2 text-sm text-white/65">
              Simple recipes, beautiful moments.
            </p>
          </div>

          <div className="flex gap-6 text-sm text-white/75">
            <Link href="/" className="transition hover:text-[#e8a65b]">
              Home
            </Link>

            <Link
              href="/recipes"
              className="transition hover:text-[#e8a65b]"
            >
              Recipes
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-7xl border-t border-white/15 pt-5 text-center text-xs text-white/50">
          © {new Date().getFullYear()} Everyday Kitchen. All rights reserved.
        </div>
      </footer>
    </main>
  );
}