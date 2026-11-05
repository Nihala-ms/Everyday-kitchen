
const WISHLIST_KEY = "everyday-kitchen-wishlist";

export function getWishlist(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(WISHLIST_KEY);
    const parsed = stored ? JSON.parse(stored) : [];

    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

export function isInWishlist(recipeId: string): boolean {
  return getWishlist().includes(recipeId);
}

export function toggleWishlist(recipeId: string): boolean {
  const current = getWishlist();
  const exists = current.includes(recipeId);

  const updated = exists
    ? current.filter((id) => id !== recipeId)
    : [...current, recipeId];

  localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("wishlistUpdated"));

  return !exists;
}
