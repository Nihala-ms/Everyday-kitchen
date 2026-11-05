
"use client";

import { useCallback, useEffect, useState } from "react";

type Review = {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
};

type ReviewData = {
  success: boolean;
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
};

export default function RecipeReviews({ slug }: { slug: string }) {
  const [data, setData] = useState<ReviewData>({
    success: true,
    averageRating: 0,
    totalReviews: 0,
    reviews: [],
  });

  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/recipes/${encodeURIComponent(slug)}/reviews`,
        { cache: "no-store" }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load reviews.");
      }

      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load reviews."
      );
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!name.trim() || !comment.trim()) {
      setError("Please complete all fields.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        `/api/recipes/${encodeURIComponent(slug)}/reviews`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            rating,
            comment: comment.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to submit your review.");
      }

      setMessage(result.message);
      setName("");
      setRating(5);
      setComment("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to submit your review."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-16 border-t border-[#e9e5da] pt-12">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b47a3e]">
          Community feedback
        </p>
        <h2 className="mt-2 font-serif text-3xl text-[#26352c]">
          Ratings & Reviews
        </h2>
        <p className="mt-2 text-sm text-[#68736a]">
          Share your experience and help others try this recipe.
        </p>
      </div>

      <div className="mb-10 rounded-2xl bg-[#f6f4eb] p-6">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-serif text-5xl text-[#26352c]">
            {data.averageRating.toFixed(1)}
          </span>

          <div>
            <div className="text-xl tracking-wider text-[#d99a43]">
              {"★".repeat(Math.round(data.averageRating))}
              {"☆".repeat(5 - Math.round(data.averageRating))}
            </div>
            <p className="mt-1 text-sm text-[#68736a]">
              {data.totalReviews} approved{" "}
              {data.totalReviews === 1 ? "review" : "reviews"}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h3 className="mb-5 font-serif text-2xl text-[#26352c]">
          Write a Review
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="review-name"
              className="mb-2 block text-sm font-medium text-[#26352c]"
            >
              Your name
            </label>
            <input
              id="review-name"
              type="text"
              maxLength={50}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your name"
              required
              className="w-full rounded-xl border border-[#deded3] bg-white px-4 py-3 outline-none focus:border-[#456b50]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#26352c]">
              Your rating
            </label>
            <div className="flex gap-2" role="group" aria-label="Choose rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  aria-label={`${star} star${star > 1 ? "s" : ""}`}
                  aria-pressed={rating === star}
                  className={`text-3xl transition ${
                    star <= rating ? "text-[#d99a43]" : "text-[#d8d5ca]"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="review-comment"
              className="mb-2 block text-sm font-medium text-[#26352c]"
            >
              Your review
            </label>
            <textarea
              id="review-comment"
              rows={4}
              minLength={5}
              maxLength={1000}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="How did the recipe turn out?"
              required
              className="w-full rounded-xl border border-[#deded3] bg-white px-4 py-3 outline-none focus:border-[#456b50]"
            />
            <p className="mt-1 text-right text-xs text-[#899087]">
              {comment.length}/1000
            </p>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          {message && (
            <p role="status" className="text-sm text-[#315c43]">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-[#456b50] px-7 py-3 font-medium text-white transition hover:bg-[#315c43] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>

      <div>
        <h3 className="mb-5 font-serif text-2xl text-[#26352c]">
          What People Say
        </h3>

        {loading ? (
          <p className="text-sm text-[#68736a]">Loading reviews...</p>
        ) : data.reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#deded3] p-8 text-center">
            <p className="font-serif text-xl text-[#26352c]">
              No reviews yet
            </p>
            <p className="mt-2 text-sm text-[#68736a]">
              Be the first to share your experience!
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {data.reviews.map((review) => (
              <article
                key={review._id}
                className="rounded-2xl border border-[#e9e5da] bg-white p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-[#26352c]">
                      {review.name}
                    </h4>
                    <p className="mt-1 text-xs text-[#899087]">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <span
                    className="tracking-wider text-[#d99a43]"
                    aria-label={`${review.rating} out of 5 stars`}
                  >
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </span>
                </div>

                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#59645b]">
                  {review.comment}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
