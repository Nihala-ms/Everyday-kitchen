
"use client";

import { useEffect, useState } from "react";
import { isInWishlist, toggleWishlist } from "@/lib/wishlist";

interface WishlistButtonProps {
  recipeId: string;
  recipeTitle?: string;
  className?: string;
}

export default function WishlistButton({
  recipeId,
  recipeTitle = "recipe",
  className = "",
}: WishlistButtonProps) {
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSaved(isInWishlist(recipeId));
    setReady(true);

    const sync = () => setSaved(isInWishlist(recipeId));

    window.addEventListener("wishlistUpdated", sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener("wishlistUpdated", sync);
      window.removeEventListener("storage", sync);
    };
  }, [recipeId]);

  const handleToggle = () => {
    const result = toggleWishlist(recipeId);
    setSaved(result);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={!ready}
      aria-label={
        saved
          ? `Remove ${recipeTitle} from wishlist`
          : `Add ${recipeTitle} to wishlist`
      }
      aria-pressed={saved}
      title={saved ? "Remove from Wishlist" : "Add to Wishlist"}
      className={`flex h-10 w-10 items-center justify-center rounded-full border border-[#eee9df] bg-white text-xl shadow-sm transition hover:scale-105 hover:bg-[#f6f4eb] disabled:opacity-50 ${className}`}
    >
      <span className={saved ? "text-red-500" : "text-[#777d73]"}>
        {saved ? "♥" : "♡"}
      </span>
    </button>
  );
}
