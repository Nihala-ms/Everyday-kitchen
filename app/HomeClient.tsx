
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import WishlistButton from "@/components/WishlistButton";

const categories = [
  { name: "All", icon: "🍽️" },
  { name: "Breakfast", icon: "🍳" },
  { name: "Lunch", icon: "🍛" },
  { name: "Dinner", icon: "🥘" },
  { name: "Snacks", icon: "🍘" },
  { name: "Desserts", icon: "🍮" },
];

interface Recipe {
  _id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  image?: string;
  imageAlt?: string;
  prepTime?: number;
  cookTime?: number;
  totalTime?: number;
  difficulty?: string;
}

function formatTime(minutes: number) {
  if (!minutes || minutes <= 0) return "Time not specified";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0 && remainingMinutes > 0) {
    return `${hours}h ${remainingMinutes} mins`;
  }

  if (hours > 0) return `${hours}h`;

  return `${minutes} mins`;
}

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRecipes = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/recipes", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load recipes");
      }

      setRecipes(Array.isArray(data.recipes) ? data.recipes : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const filteredRecipes = useMemo(() => {
    const searchTerm = search.toLowerCase().trim();

    return recipes.filter((recipe) => {
      const matchesCategory =
        activeCategory === "All" ||
        recipe.category === activeCategory;

      const matchesSearch =
        recipe.title.toLowerCase().includes(searchTerm) ||
        recipe.category.toLowerCase().includes(searchTerm) ||
        (recipe.description || "").toLowerCase().includes(searchTerm);

      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory, recipes]);

  // Show only 8 matching recipes on the homepage.
  const displayedRecipes = useMemo(() => {
    return filteredRecipes.slice(0, 8);
  }, [filteredRecipes]);

  const getCount = (category: string) => {
    if (category === "All") return recipes.length;

    return recipes.filter(
      (recipe) => recipe.category === category
    ).length;
  };

  return (
    <main className="min-h-screen bg-[#fffdf8]">

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#eee9df] bg-[#fffdf8]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-10">

          <a
            href="/"
            className="text-2xl font-bold tracking-tight text-[#315c43]"
          >
            Everyday<span className="text-[#e8a65b]">.</span>Kitchen
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a href="/" className="text-[#315c43]">
              Home
            </a>

            <a href="#categories" className="hover:text-[#315c43]">
              Categories
            </a>

            <a href="/recipes" className="hover:text-[#315c43]">
              Recipes
            </a>

            <a href="/wishlist" className="hover:text-[#315c43]">
              ♡ Wishlist
            </a>
            <a href="/meal-planner" className="hover:text-[#315c43]">
            Meal Planner
          </a>

            
          </nav>

          <a
            href="/recipes"
            className="hidden rounded-full bg-[#456b50] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#315c43] sm:inline-block"
          >
            Explore Recipes →
          </a>

          {/* Mobile Menu */}
          <details className="relative md:hidden">
            <summary className="cursor-pointer list-none rounded-lg border border-[#dcded4] px-4 py-2 font-semibold text-[#315c43]">
              ☰ Menu
            </summary>

            <nav className="absolute right-0 top-12 z-50 flex w-48 flex-col gap-4 rounded-xl border border-[#eee9df] bg-white p-5 shadow-xl">
              <a href="/" className="text-[#315c43]">
                Home
              </a>

              <a href="#categories">
                Categories
              </a>

              <a href="/recipes">
                Recipes
              </a>

              <a href="/wishlist">
                ♡ Wishlist
              </a>

              <a href="/meal-planner" className="hover:text-[#315c43]">
            Meal Planner
          </a>
            </nav>
          </details>

        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-2 lg:px-10 lg:py-24">

        <div>
          <span className="mb-6 inline-block rounded-full bg-[#f5ead9] px-4 py-2 text-sm font-semibold text-[#9b672c]">
            ✨ Homemade food, made with love
          </span>

          <h1 className="max-w-xl text-5xl leading-[1.12] font-bold tracking-tight text-[#26352c] md:text-6xl">
            Cook something
            <span className="text-[#315c43]"> delicious </span>
            every day.
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-[#777d73]">
            Discover easy Kerala and Indian recipes, simple ingredients
            and step-by-step cooking ideas for your everyday kitchen.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="/recipes"
              className="rounded-full bg-[#456b50] px-7 py-4 font-semibold text-white transition hover:bg-[#315c43]"
            >
              Explore Recipes →
            </a>

            <a
              href="#categories"
              className="rounded-full border border-[#dcded4] px-7 py-4 font-semibold text-[#315c43] transition hover:bg-[#f3f2e9]"
            >
              Browse Categories
            </a>
          </div>

          <div className="mt-10 flex gap-8 text-sm text-[#777d73]">
            <div>
              <p className="text-2xl font-bold text-[#315c43]">
                {loading ? "..." : recipes.length}
              </p>
              <span>Published recipes</span>
            </div>

            <div>
              <p className="text-2xl font-bold text-[#315c43]">
                {categories.length - 1}
              </p>
              <span>Food categories</span>
            </div>

            <div>
              <p className="text-2xl font-bold text-[#315c43]">
                100%
              </p>
              <span>Homemade love</span>
            </div>
          </div>
        </div>

        <div
          className="relative min-h-[380px] overflow-hidden rounded-[32px] bg-cover bg-center shadow-xl md:min-h-[480px]"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1547592180-85f173990554?w=1200')",
          }}
          role="img"
          aria-label="Fresh homemade food served on a table"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />

          <div className="absolute bottom-7 left-7 rounded-2xl bg-white/95 p-5 shadow-lg">
            <p className="text-xs font-semibold tracking-widest text-[#a16d32] uppercase">
              Made for your kitchen
            </p>

            <p className="mt-1 text-xl font-bold text-[#315c43]">
              Good food, happy hearts.
            </p>
          </div>
        </div>

      </section>

      {/* Categories */}
      <section
        id="categories"
        className="bg-[#f6f4eb] px-5 py-20 lg:px-10"
      >
        <div className="mx-auto max-w-7xl">

          <div className="mb-10 text-center">
            <p className="font-semibold tracking-widest text-[#b47a3e] uppercase">
              Explore by category
            </p>

            <h2 className="mt-3 text-3xl font-bold text-[#26352c] md:text-4xl">
              What are you cooking today?
            </h2>

            <p className="mt-3 text-[#777d73]">
              Choose a category to discover recipes.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
              <button
                type="button"
                key={category.name}
                onClick={() => {
                  setActiveCategory(category.name);
                  document.getElementById("recipes")?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
                className={`rounded-3xl border p-6 text-center transition hover:-translate-y-1 hover:shadow-lg ${activeCategory === category.name
                    ? "border-[#315c43] bg-[#315c43] text-white"
                    : "border-[#ece9df] bg-white text-[#315c43]"
                  }`}
              >
                <span className="text-4xl">
                  {category.icon}
                </span>

                <h3 className="mt-4 font-bold">
                  {category.name}
                </h3>

                <p
                  className={`mt-1 text-sm ${activeCategory === category.name
                      ? "text-white/75"
                      : "text-[#888d82]"
                    }`}
                >
                  {loading ? "..." : getCount(category.name)} recipes
                </p>
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* Recipes */}
      <section
        id="recipes"
        className="mx-auto max-w-7xl px-5 py-20 lg:px-10"
      >

        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-semibold tracking-widest text-[#b47a3e] uppercase">
              Handpicked for you
            </p>

            <h2 className="mt-3 text-3xl font-bold text-[#26352c] md:text-4xl">
              {activeCategory === "All"
                ? "Popular Recipes"
                : `${activeCategory} Recipes`}
            </h2>

            <p className="mt-3 text-[#777d73]">
              Find delicious dishes to prepare at home.
            </p>
          </div>

          <a
            href="/recipes"
            className="font-semibold text-[#315c43] hover:underline"
          >
            View all recipes →
          </a>
        </div>

        {/* Search */}
        <div className="mb-8">
          <label
            htmlFor="recipe-search"
            className="mb-2 block text-sm font-semibold text-[#315c43]"
          >
            Search recipes
          </label>

          <div className="flex max-w-xl items-center gap-3 rounded-full border border-[#e5e1d7] bg-white px-5 py-3 shadow-sm">
            <span>🔍</span>

            <input
              id="recipe-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by recipe name or category..."
              className="w-full bg-transparent text-sm text-[#26352c] outline-none placeholder:text-[#999]"
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
        </div>

        <p className="mb-5 text-sm text-[#777d73]">
          {loading
            ? "Loading recipes..."
            : `Showing ${displayedRecipes.length} of ${filteredRecipes.length} matching recipes`}
        </p>

        {/* Loading */}
        {loading && (
          <div className="py-16 text-center text-[#777d73]">
            Loading delicious recipes...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-3xl bg-[#f6f4eb] px-5 py-16 text-center">
            <p className="text-4xl">😕</p>

            <h3 className="mt-4 text-xl font-bold text-[#315c43]">
              Unable to load recipes
            </h3>

            <p className="mt-2 text-[#777d73]">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchRecipes}
              className="mt-5 rounded-full bg-[#315c43] px-6 py-3 font-semibold text-white"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Recipe Cards */}
        {!loading && !error && displayedRecipes.length > 0 && (
          <>
            <div className="grid items-stretch gap-7 sm:grid-cols-2 lg:grid-cols-4">
              {displayedRecipes.map((recipe) => {
                const recipeTime =
                  recipe.totalTime ||
                  ((recipe.prepTime || 0) + (recipe.cookTime || 0));

                return (
                  <article
                    key={recipe._id}
                    className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#eee9df] bg-white transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    {/* Recipe Image */}
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
                      {/* Category Badge */}
                      <span className="absolute top-4 left-4 rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#315c43]">
                        {recipe.category}
                      </span>

                      {/* Wishlist Button */}
                      <WishlistButton
                        recipeId={recipe._id}
                        recipeTitle={recipe.title}
                        className="absolute top-4 right-4 z-10"
                      />
                    </div>

                    {/* Recipe Details */}
                    <div className="flex flex-1 flex-col p-5">
                      <p className="text-xs font-semibold tracking-wider text-[#b47a3e] uppercase">
                        {recipe.category}
                      </p>

                      <h3 className="mt-2 min-h-[56px] text-xl font-bold text-[#26352c] group-hover:text-[#315c43]">
                        {recipe.title}
                      </h3>

                      <p className="mt-2 min-h-[96px] text-sm leading-6 text-[#777d73] line-clamp-4">
                        {recipe.description}
                      </p>

                      <div className="mt-auto flex items-center justify-between border-t border-[#eee9df] pt-4 text-sm">
                        <span className="text-[#777d73]">
                          ◷ {formatTime(recipeTime)}
                        </span>

                        <span className="text-xs text-[#777d73]">
                          {recipe.difficulty || "Homemade"}
                        </span>
                      </div>

                      <a
                        href={`/recipes/${recipe.slug}`}
                        className="mt-5 block rounded-full bg-[#315c43] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#244630]"
                      >
                        View Recipe →
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-10 text-center">
              <a
                href="/recipes"
                className="inline-block rounded-full bg-[#e8bb88] px-8 py-3.5 font-semibold text-[#243b2c] shadow-md transition duration-300 hover:bg-[#d99545] hover:shadow-lg"
              >
                Explore All Recipes →
              </a>
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && !error && filteredRecipes.length === 0 && (
          <div className="rounded-3xl bg-[#f6f4eb] px-5 py-16 text-center">
            <p className="text-4xl">🍽️</p>

            <h3 className="mt-4 text-xl font-bold text-[#315c43]">
              {recipes.length === 0
                ? "No recipes published yet"
                : "No recipes found"}
            </h3>

            <p className="mt-2 text-[#777d73]">
              {recipes.length === 0
                ? "Published recipes will appear here once you add them through the admin dashboard."
                : "Try another recipe name or choose a different category."}
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActiveCategory("All");
              }}
              className="mt-5 rounded-full bg-[#315c43] px-6 py-3 font-semibold text-white"
            >
              Clear filters
            </button>
          </div>
        )}

      </section>

      {/* About */}
      <section
        id="about"
        className="bg-[#315c43] px-5 py-20 text-center text-white"
      >
        <div className="mx-auto max-w-2xl">
          <p className="font-semibold tracking-widest text-[#f3c78e] uppercase">
            Welcome to our kitchen
          </p>

          <h2 className="mt-4 text-3xl leading-tight font-bold md:text-4xl">
            Every recipe has a story. Every meal makes a memory.
          </h2>

          <p className="mt-5 leading-8 text-white/75">
            Everyday Kitchen brings together traditional Kerala flavours
            and everyday Indian cooking ideas to make home cooking simple,
            enjoyable and delicious.
          </p>

          <a
            href="/recipes"
            className="mt-8 inline-block rounded-full bg-[#f3c78e] px-7 py-4 font-semibold text-[#243b2c] shadow-md transition duration-300 hover:bg-[#e8a65b] hover:text-white"
          >
            Discover Recipes →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#243b2c] px-5 py-10 text-center text-white">
        <a href="/" className="text-2xl font-bold">
          Everyday<span className="text-[#e8a65b]">.</span>Kitchen
        </a>

        <p className="mt-3 text-sm text-white/65">
          Simple ingredients. Delicious memories.
        </p>

        <div className="mt-6 flex justify-center gap-6 text-sm text-white/75">
          <a href="#categories" className="hover:text-white">
            Categories
          </a>

          <a href="/recipes" className="hover:text-white">
            Recipes
          </a>

          <a href="/wishlist" className="hover:text-white">
            Wishlist
          </a>

          <a href="/meal-planner" className="hover:text-[#315c43]">
            Meal Planner
          </a>
        </div>

        <p className="mt-8 text-xs text-white/50">
          © 2026 Everyday Kitchen. All rights reserved.
        </p>
      </footer>

    </main>
  );
}
