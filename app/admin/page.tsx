
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

interface Recipe {
  _id: string;
  title: string;
  slug: string;
  category: string;
  status: "draft" | "published";
  createdAt?: string;
}

interface Stats {
  totalRecipes: number;
  publishedRecipes: number;
  draftRecipes: number;
}

type StatusFilter = "all" | "published" | "draft";
type SortOption = "newest" | "oldest" | "title";

const PAGE_SIZE = 10;

export default function AdminDashboard() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalRecipes: 0,
    publishedRecipes: 0,
    draftRecipes: 0,
  });

  async function handleLogout() {
  await fetch("/api/admin/logout", {
    method: "POST",
  });

  window.location.href = "/admin/login";
}

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");
  const [sortOption, setSortOption] =
    useState<SortOption>("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchRecipes = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch("/api/admin/recipes", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load recipes");
      }

      setRecipes(data.recipes || []);
      setStats(data.stats || {
        totalRecipes: 0,
        publishedRecipes: 0,
        draftRecipes: 0,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const categories = useMemo(() => {
    return [...new Set(recipes.map((recipe) => recipe.category))]
      .filter(Boolean)
      .sort();
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    let result = [...recipes];

    if (search.trim()) {
      const term = search.toLowerCase().trim();

      result = result.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(term) ||
          recipe.slug.toLowerCase().includes(term) ||
          recipe.category.toLowerCase().includes(term)
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter(
        (recipe) => recipe.category === categoryFilter
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(
        (recipe) => recipe.status === statusFilter
      );
    }

    if (sortOption === "newest") {
      result.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
    } else if (sortOption === "oldest") {
      result.sort(
        (a, b) =>
          new Date(a.createdAt || 0).getTime() -
          new Date(b.createdAt || 0).getTime()
      );
    } else {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [recipes, search, categoryFilter, statusFilter, sortOption]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRecipes.length / PAGE_SIZE)
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedRecipes = filteredRecipes.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  function resetFilters() {
    setSearch("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setSortOption("newest");
    setCurrentPage(1);
  }

  async function handleStatusChange(recipe: Recipe) {
    const newStatus =
      recipe.status === "published" ? "draft" : "published";

    setUpdatingId(recipe._id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/recipes/${recipe._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Status update failed");
      }

      setSuccess(data.message || "Recipe status updated!");
      await fetchRecipes(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Status update failed"
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(recipe: Recipe) {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${recipe.title}"?`
    );

    if (!confirmed) return;

    setUpdatingId(recipe._id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/recipes/${recipe._id}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Delete failed");
      }

      setSuccess("Recipe deleted successfully!");
      await fetchRecipes(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Delete failed"
      );
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-purple-700" />
          <p className="font-medium text-gray-600">
            Loading your dashboard...
          </p>
        </div>
      </main>
    );
  }

  if (error && recipes.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">
            Unable to load dashboard
          </h1>
          <p className="mt-3 text-sm text-red-600">{error}</p>
          <button
            onClick={() => fetchRecipes()}
            className="mt-5 rounded-lg bg-purple-700 px-5 py-3 font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-purple-700">
              Everyday Kitchen
            </p>
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your recipes and website content.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => fetchRecipes(true)}
              disabled={refreshing}
              className="rounded-xl border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              {refreshing ? "Refreshing..." : "↻ Refresh"}
            </button>
                      <Link
  href="/admin/reviews"
  className="rounded-xl bg-[#456b50] px-5 py-3 text-sm font-medium text-white hover:bg-[#315c43]"
>
  Manage Reviews
</Link>
  

            <Link
              href="/admin/recipes/new"
              className="rounded-xl bg-purple-700 px-5 py-3 text-center font-semibold text-white shadow-sm hover:bg-purple-800"
            >
              + Add Recipe
            </Link>
            <button
  type="button"
  onClick={handleLogout}
  className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
>
  Logout
</button>
          </div>
        </header>

        {/* MESSAGES */}
        {success && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* STATISTICS */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Total Recipes
            </p>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              {stats.totalRecipes}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              All recipes in your database
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Published Recipes
            </p>
            <p className="mt-3 text-3xl font-bold text-green-600">
              {stats.publishedRecipes}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Visible to website visitors
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Draft Recipes
            </p>
            <p className="mt-3 text-3xl font-bold text-orange-500">
              {stats.draftRecipes}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Waiting to be published
            </p>
          </div>
        </section>

        {/* RECIPE MANAGEMENT */}
        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

          <div className="border-b border-gray-100 p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Manage Recipes
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Search, filter and manage your recipe collection.
                </p>
              </div>
              <span className="text-sm text-gray-500">
                {filteredRecipes.length} result(s)
              </span>
            </div>
          </div>

          {/* SEARCH AND FILTERS */}
          <div className="grid gap-3 border-b border-gray-100 bg-gray-50 p-5 md:grid-cols-2 xl:grid-cols-4">
            <input
              type="search"
              placeholder="Search recipes..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
            />

            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-purple-600"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as StatusFilter);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-purple-600"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            <select
              value={sortOption}
              onChange={(e) =>
                setSortOption(e.target.value as SortOption)
              }
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-purple-600"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title A–Z</option>
            </select>

            <div className="md:col-span-2 xl:col-span-4">
              <button
                onClick={resetFilters}
                className="text-sm font-semibold text-purple-700 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          </div>

          {/* TABLE */}
          {paginatedRecipes.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <p className="text-lg font-semibold text-gray-700">
                No recipes found
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Try changing your search or filters.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 font-semibold text-purple-700 hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-6 py-4">Recipe</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Created</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {paginatedRecipes.map((recipe) => (
                      <tr
                        key={recipe._id}
                        className="transition hover:bg-gray-50"
                      >
                        <td className="px-6 py-5">
                          <p className="font-semibold text-gray-900">
                            {recipe.title}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            /{recipe.slug}
                          </p>
                        </td>

                        <td className="px-6 py-5 text-sm text-gray-600">
                          {recipe.category}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              recipe.status === "published"
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {recipe.status === "published"
                              ? "Published"
                              : "Draft"}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-sm text-gray-500">
                          {recipe.createdAt
                            ? new Date(recipe.createdAt).toLocaleDateString()
                            : "—"}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/admin/recipes/${recipe._id}/edit`}
                              className="rounded-lg bg-purple-700 px-3 py-2 text-xs font-semibold text-white hover:bg-purple-800"
                            >
                              Edit
                            </Link>

                            {recipe.status === "published" && (
                              <Link
                                href={`/recipes/${recipe.slug}`}
                                target="_blank"
                                className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                              >
                                View
                              </Link>
                            )}

                            <button
                              onClick={() => handleStatusChange(recipe)}
                              disabled={updatingId === recipe._id}
                              className={`rounded-lg px-3 py-2 text-xs font-semibold text-white disabled:opacity-50 ${
                                recipe.status === "published"
                                  ? "bg-orange-600 hover:bg-orange-700"
                                  : "bg-green-600 hover:bg-green-700"
                              }`}
                            >
                              {updatingId === recipe._id
                                ? "Please wait..."
                                : recipe.status === "published"
                                  ? "Unpublish"
                                  : "Publish"}
                            </button>

                            <button
                              onClick={() => handleDelete(recipe)}
                              disabled={updatingId === recipe._id}
                              className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className="flex flex-col justify-between gap-4 border-t border-gray-100 px-5 py-5 sm:flex-row sm:items-center">
                <p className="text-sm text-gray-500">
                  Showing{" "}
                  {(safePage - 1) * PAGE_SIZE + 1}–
                  {Math.min(safePage * PAGE_SIZE, filteredRecipes.length)}{" "}
                  of {filteredRecipes.length} recipes
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    disabled={safePage === 1}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span className="px-2 text-sm font-semibold text-gray-700">
                    {safePage} / {totalPages}
                  </span>

                  <button
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(totalPages, page + 1)
                      )
                    }
                    disabled={safePage === totalPages}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

        <footer className="mt-8 text-center text-sm text-gray-400">
          Everyday Kitchen Admin Panel
        </footer>
      </div>
    </main>
  );
}
