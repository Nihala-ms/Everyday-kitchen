
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Review = {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  recipeId?: {
    title: string;
    slug: string;
  } | null;
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("pending");

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/reviews", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load reviews.");
      }

      setReviews(data.reviews || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load reviews."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  async function updateStatus(
    reviewId: string,
    status: "approved" | "rejected"
  ) {
    try {
      setUpdating(reviewId);
      setError("");
      setMessage("");

      const response = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reviewId, status }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update review.");
      }

      setMessage(data.message);
      await loadReviews();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update review."
      );
    } finally {
      setUpdating(null);
    }
  }

  const pendingCount = reviews.filter(
    (review) => review.status === "pending"
  ).length;

  const approvedCount = reviews.filter(
    (review) => review.status === "approved"
  ).length;

  const rejectedCount = reviews.filter(
    (review) => review.status === "rejected"
  ).length;

  const filteredReviews =
    filter === "all"
      ? reviews
      : reviews.filter((review) => review.status === filter);

  return (
    <main className="min-h-screen bg-[#fffdf8] px-5 py-10 text-[#26352c]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/admin"
              className="text-sm text-[#68736a] hover:text-[#315c43]"
            >
              ← Back to Dashboard
            </Link>

            <h1 className="mt-3 font-serif text-4xl">
              Manage Reviews
            </h1>

            <p className="mt-2 text-sm text-[#68736a]">
              Review customer feedback and approve or reject submissions.
            </p>
          </div>

          <button
            onClick={loadReviews}
            className="rounded-full border border-[#456b50] px-5 py-2.5 text-sm font-medium text-[#315c43] hover:bg-[#edf1e9]"
          >
            Refresh
          </button>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-[#f6f4eb] p-5">
            <p className="text-sm text-[#68736a]">Pending Reviews</p>
            <p className="mt-2 font-serif text-3xl">{pendingCount}</p>
          </div>

          <div className="rounded-2xl bg-[#f6f4eb] p-5">
            <p className="text-sm text-[#68736a]">Approved Reviews</p>
            <p className="mt-2 font-serif text-3xl">{approvedCount}</p>
          </div>

          <div className="rounded-2xl bg-[#f6f4eb] p-5">
            <p className="text-sm text-[#68736a]">Rejected Reviews</p>
            <p className="mt-2 font-serif text-3xl">{rejectedCount}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {["pending", "approved", "rejected", "all"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded-full px-5 py-2 text-sm font-medium capitalize transition ${
                filter === status
                  ? "bg-[#456b50] text-white"
                  : "border border-[#deded3] bg-white text-[#68736a] hover:bg-[#f6f4eb]"
              }`}
            >
              {status === "all" ? "All Reviews" : status}
            </button>
          ))}
        </div>

        {error && (
          <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        )}

        {message && (
          <p role="status" className="mb-5 rounded-xl bg-[#edf1e9] p-4 text-sm text-[#315c43]">
            {message}
          </p>
        )}

        {loading ? (
          <div className="rounded-2xl bg-[#f6f4eb] p-10 text-center">
            Loading reviews...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#deded3] p-12 text-center">
            <h2 className="font-serif text-2xl">No reviews found</h2>
            <p className="mt-2 text-sm text-[#68736a]">
              Reviews submitted by visitors will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredReviews.map((review) => (
              <article
                key={review._id}
                className="rounded-2xl border border-[#e9e5da] bg-white p-5 md:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-xl">
                      {review.recipeId?.title || "Recipe unavailable"}
                    </h2>

                    {review.recipeId?.slug && (
                      <Link
                        href={`/recipes/${review.recipeId.slug}`}
                        target="_blank"
                        className="mt-1 inline-block text-xs text-[#456b50] underline"
                      >
                        View recipe
                      </Link>
                    )}
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      review.status === "approved"
                        ? "bg-green-50 text-green-700"
                        : review.status === "rejected"
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {review.status}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{review.name}</p>
                    <p className="mt-1 text-xs text-[#899087]">
                      {new Date(review.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <span className="tracking-wider text-[#d99a43]">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </span>
                </div>

                <p className="mt-4 whitespace-pre-wrap rounded-xl bg-[#f6f4eb] p-4 text-sm leading-7 text-[#59645b]">
                  {review.comment}
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  {review.status !== "approved" && (
                    <button
                      onClick={() => updateStatus(review._id, "approved")}
                      disabled={updating === review._id}
                      className="rounded-full bg-[#456b50] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#315c43] disabled:opacity-50"
                    >
                      {updating === review._id
                        ? "Updating..."
                        : "✓ Approve"}
                    </button>
                  )}

                  {review.status !== "rejected" && (
                    <button
                      onClick={() => updateStatus(review._id, "rejected")}
                      disabled={updating === review._id}
                      className="rounded-full border border-red-200 px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
