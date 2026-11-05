
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import WishlistButton from "@/components/WishlistButton";

interface Recipe {
  _id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  image?: string;
  imageAlt?: string;
  totalTime?: number;
  prepTime?: number;
  cookTime?: number;
}

export default function WishlistPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const saved = localStorage.getItem("everyday-kitchen-wishlist");
      const ids: string[] = saved ? JSON.parse(saved) : [];

      setWishlistIds(Array.isArray(ids) ? ids : []);

      const response = await fetch("/api/recipes", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load recipes");
      }

      const allRecipes: Recipe[] = Array.isArray(data.recipes)
        ? data.recipes
        : [];

      setRecipes(
        allRecipes.filter((recipe) => ids.includes(recipe._id))
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWishlist();

    const handleUpdate = () => loadWishlist();

    window.addEventListener("wishlistUpdated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("wishlistUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [loadWishlist]);

  return (
    <main className="min-h-screen bg-[#fffdf8]">

      {/* Header */}
      <header className="border-b border-[#eee9df] bg-[#fffdf8]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-10">
          <Link
            href="/"
            className="text-2xl font-bold text-[#315c43]"
          >
            Everyday<span className="text-[#e8a65b]">.</span>Kitchen
          </Link>

          <nav className="flex items-center gap-5 text-sm font-medium text-[#315c43]">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <Link href="/recipes" className="hover:underline">
              Recipes
            </Link>
          </nav>
        </div>
      </header>

      {/* Page Heading */}
      <section className="bg-[#f6f4eb] px-5 py-16 text-center">
        <p className="font-semibold tracking-widest text-[#b47a3e] uppercase">
          Your personal collection
        </p>

        <h1 className="mt-3 text-4xl font-bold text-[#26352c] md:text-5xl">
          My Wishlist ♡
        </h1>

        <p className="mt-4 text-[#777d73]">
          Your favourite recipes, all in one place.
        </p>
      </section>

      {/* Wishlist Content */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-10">

        {!loading && !error && (
          <p className="mb-8 text-sm text-[#777d73]">
            {recipes.length} saved {recipes.length === 1 ? "recipe" : "recipes"}
          </p>
        )}

        {loading && (
          <div className="py-20 text-center text-[#777d73]">
            Loading your wishlist...
          </div>
        )}

        {error && (
          <div className="rounded-3xl bg-[#f6f4eb] p-10 text-center">
            <p className="text-lg font-semibold text-[#315c43]">
              Unable to load your wishlist
            </p>
            <p className="mt-2 text-sm text-[#777d73]">{error}</p>
            <button
              onClick={loadWishlist}
              className="mt-5 rounded-full bg-[#315c43] px-6 py-3 text-white"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && recipes.length === 0 && (
          <div className="rounded-3xl bg-[#f6f4eb] px-5 py-20 text-center">
            <p className="text-6xl">♡</p>

            <h2 className="mt-5 text-2xl font-bold text-[#315c43]">
              Your wishlist is empty
            </h2>

            <p className="mt-3 text-[#777d73]">
              Explore recipes and tap the heart icon to save your favourites.
            </p>

            <Link
              href="/recipes"
              className="mt-7 inline-block rounded-full bg-[#315c43] px-7 py-3.5 font-semibold text-white transition hover:bg-[#244630]"
            >
              Explore Recipes →
            </Link>
          </div>
        )}

        {!loading && !error && recipes.length > 0 && (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {recipes.map((recipe) => {
              const totalTime =
                recipe.totalTime ||
                ((recipe.prepTime || 0) + (recipe.cookTime || 0));

              return (
                <article
                  key={recipe._id}
                  className="group overflow-hidden rounded-3xl border border-[#eee9df] bg-white transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div
                    className="relative h-56 bg-[#f6f4eb] bg-cover bg-center"
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

                    <WishlistButton
                      recipeId={recipe._id}
                      recipeTitle={recipe.title}
                      className="absolute right-4 top-4 z-10"
                    />
                  </div>

                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#b47a3e]">
                      {recipe.category}
                    </p>

                    <h2 className="mt-2 text-xl font-bold text-[#26352c]">
                      {recipe.title}
                    </h2>

                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#777d73]">
                      {recipe.description}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-[#eee9df] pt-4 text-sm">
                      <span className="text-[#777d73]">
                        ◷ {totalTime > 0 ? `${totalTime} mins` : "Time not specified"}
                      </span>

                      <Link
                        href={`/recipes/${recipe.slug}`}
                        className="font-semibold text-[#315c43] hover:underline"
                      >
                        View Recipe →
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-[#243b2c] px-5 py-8 text-center text-white">
        <Link href="/" className="text-xl font-bold">
          Everyday<span className="text-[#e8a65b]">.</span>Kitchen
        </Link>
        <p className="mt-2 text-sm text-white/65">
          Simple ingredients. Delicious memories.
        </p>
      </footer>

    </main>
  );
}
