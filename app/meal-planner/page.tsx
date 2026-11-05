"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";

type Ingredient = {
  name: string;
  amount: number | null;
  unit: string;
};

type Recipe = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  image?: string;
  ingredients: Ingredient[];
};

type ShoppingItem = {
  id: string;
  name: string;
  amount: number | null;
  unit: string;
  source: "meal" | "manual";
  checked: boolean;
};

type MealPlan = Record<string, string>;

const MEAL_PLAN_KEY = "everyday-kitchen-meal-plan";
const SHOPPING_KEY = "everyday-kitchen-shopping-items";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const meals = ["Breakfast", "Lunch", "Dinner"];

function formatAmount(amount: number | null, unit: string) {
  if (amount === null || amount === undefined) return "";
  return `${amount} ${unit}`.trim();
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function MealPlannerPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlan, setMealPlan] = useState<MealPlan>({});
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [newItem, setNewItem] = useState("");
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Ensure the first browser render matches the server render.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load saved meal plan and shopping list.
  useEffect(() => {
    try {
      const storedPlan = localStorage.getItem(MEAL_PLAN_KEY);
      const storedShopping = localStorage.getItem(SHOPPING_KEY);

      if (storedPlan) {
        const parsed: unknown = JSON.parse(storedPlan);

        if (
          parsed &&
          typeof parsed === "object" &&
          !Array.isArray(parsed)
        ) {
          const validPlan: MealPlan = {};

          Object.entries(parsed).forEach(([key, value]) => {
            if (typeof value === "string") {
              validPlan[key] = value;
            }
          });

          setMealPlan(validPlan);
        }
      }

      if (storedShopping) {
        const parsed: unknown = JSON.parse(storedShopping);

        if (Array.isArray(parsed)) {
          const validItems = parsed.filter(
            (item): item is ShoppingItem =>
              item &&
              typeof item.id === "string" &&
              typeof item.name === "string" &&
              (item.source === "meal" || item.source === "manual")
          );

          setShoppingItems(validItems);
        }
      }
    } catch (err) {
      console.error("Unable to load saved planner data:", err);
    } finally {
      setLoaded(true);
    }
  }, []);

  // Fetch published recipes.
  useEffect(() => {
    const controller = new AbortController();

    async function fetchRecipes() {
      try {
        const response = await fetch("/api/recipes", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load recipes.");
        }

        const data = await response.json();

        const recipeList = Array.isArray(data)
          ? data
          : Array.isArray(data.recipes)
            ? data.recipes
            : [];

        setRecipes(recipeList);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error(err);
        setError("Unable to load recipes. Please refresh the page.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchRecipes();

    return () => {
      controller.abort();
    };
  }, []);

  // Save data after the initial localStorage load.
  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem(
        MEAL_PLAN_KEY,
        JSON.stringify(mealPlan)
      );

      localStorage.setItem(
        SHOPPING_KEY,
        JSON.stringify(shoppingItems)
      );

      setSaved(true);
    } catch (err) {
      console.error("Unable to save planner data:", err);
      setSaved(false);
    }
  }, [mealPlan, shoppingItems, loaded]);

  const getMealKey = (day: string, meal: string) =>
    `${day}-${meal}`;

  const selectedRecipeCount =
    Object.values(mealPlan).filter(Boolean).length;

  // Get selected recipes.
  const selectedRecipes = useMemo(() => {
    return Object.values(mealPlan)
      .map((id) => recipes.find((recipe) => recipe._id === id))
      .filter((recipe): recipe is Recipe => Boolean(recipe));
  }, [mealPlan, recipes]);

  // Generate ingredient suggestions from selected recipes.
  const suggestions = useMemo(() => {
    const grouped = new Map<
      string,
      { name: string; amount: number | null; unit: string }
    >();

    selectedRecipes.forEach((recipe) => {
      (recipe.ingredients || []).forEach((ingredient) => {
        const name = ingredient.name?.trim();

        if (!name) return;

        const unit = ingredient.unit?.trim() || "";
        const key = `${name.toLowerCase()}-${unit.toLowerCase()}`;

        const existing = grouped.get(key);

        if (existing) {
          if (
            existing.amount !== null &&
            typeof ingredient.amount === "number"
          ) {
            existing.amount += ingredient.amount;
          } else {
            existing.amount = null;
          }
        } else {
          grouped.set(key, {
            name,
            amount:
              typeof ingredient.amount === "number"
                ? ingredient.amount
                : null,
            unit,
          });
        }
      });
    });

    return Array.from(grouped.values());
  }, [selectedRecipes]);

  // Add one suggested ingredient.
  const addSuggestion = (ingredient: {
    name: string;
    amount: number | null;
    unit: string;
  }) => {
    const alreadyAdded = shoppingItems.some(
      (item) =>
        item.name.toLowerCase() === ingredient.name.toLowerCase() &&
        item.unit.toLowerCase() === ingredient.unit.toLowerCase()
    );

    if (alreadyAdded) return;

    setShoppingItems((previous) => [
      ...previous,
      {
        id: `meal-${createId()}`,
        name: ingredient.name,
        amount: ingredient.amount,
        unit: ingredient.unit,
        source: "meal",
        checked: false,
      },
    ]);
  };

  // Add all suggestions that are not already present.
  const addAllSuggestions = () => {
    const newItems: ShoppingItem[] = [];

    suggestions.forEach((ingredient) => {
      const alreadyAdded = shoppingItems.some(
        (item) =>
          item.name.toLowerCase() === ingredient.name.toLowerCase() &&
          item.unit.toLowerCase() === ingredient.unit.toLowerCase()
      );

      const alreadyInBatch = newItems.some(
        (item) =>
          item.name.toLowerCase() === ingredient.name.toLowerCase() &&
          item.unit.toLowerCase() === ingredient.unit.toLowerCase()
      );

      if (!alreadyAdded && !alreadyInBatch) {
        newItems.push({
          id: `meal-${createId()}`,
          name: ingredient.name,
          amount: ingredient.amount,
          unit: ingredient.unit,
          source: "meal",
          checked: false,
        });
      }
    });

    if (newItems.length > 0) {
      setShoppingItems((previous) => [...previous, ...newItems]);
    }
  };

  // Add manual shopping item.
  const addManualItem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = newItem.trim();

    if (!name) return;

    const alreadyAdded = shoppingItems.some(
      (item) => item.name.toLowerCase() === name.toLowerCase()
    );

    if (alreadyAdded) {
      setError("This item is already in your shopping list.");
      return;
    }

    setShoppingItems((previous) => [
      ...previous,
      {
        id: `manual-${createId()}`,
        name,
        amount: null,
        unit: "",
        source: "manual",
        checked: false,
      },
    ]);

    setNewItem("");
    setError("");
  };

  // Toggle shopping item completion.
  const toggleChecked = (id: string) => {
    setShoppingItems((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, checked: !item.checked }
          : item
      )
    );
  };

  // Delete a shopping item.
  const deleteShoppingItem = (id: string) => {
    setShoppingItems((previous) =>
      previous.filter((item) => item.id !== id)
    );
  };

  // Clear shopping list.
  const clearShoppingList = () => {
    if (!window.confirm("Are you sure you want to clear the shopping list?")) {
      return;
    }

    setShoppingItems([]);
  };

  // Clear meal plan.
  const clearMealPlan = () => {
    if (!window.confirm("Are you sure you want to clear your entire meal plan?")) {
      return;
    }

    setMealPlan({});
  };

  const checkedCount = shoppingItems.filter(
    (item) => item.checked
  ).length;

  const remainingCount = shoppingItems.length - checkedCount;

  const completionPercentage =
    shoppingItems.length > 0
      ? Math.round((checkedCount / shoppingItems.length) * 100)
      : 0;

  return (
    <main className="min-h-screen bg-[#fffdf8] text-[#26352c]">
      {/* Header */}
      <header className="border-b border-[#e9e5da] bg-[#fffdf8]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <Link href="/" className="font-serif text-2xl font-bold">
            Everyday<span className="text-[#b47a3e]">.</span>Kitchen
          </Link>

          <nav className="flex items-center gap-5 text-sm font-medium">
            <Link href="/" className="hover:text-[#315c43]">
              Home
            </Link>

            <Link href="/recipes" className="hover:text-[#315c43]">
              Recipes
            </Link>

            <Link href="/wishlist" className="hover:text-[#315c43]">
              Wishlist
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#f6f4eb] px-5 py-14 md:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#b47a3e]">
            Plan • Prepare • Enjoy
          </p>

          <div className="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="max-w-2xl font-serif text-4xl leading-tight md:text-6xl">
                Your Weekly Meal Planner
              </h1>

              <p className="mt-4 max-w-xl leading-7 text-[#68736a]">
                Plan your meals for the week and organise your shopping list
                in one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/recipes"
                className="rounded-full border border-[#456b50] px-6 py-3 text-sm font-medium text-[#315c43] transition hover:bg-[#e9eee8]"
              >
                Explore Recipes
              </Link>

              <button
                type="button"
                onClick={clearMealPlan}
                className="rounded-full bg-[#456b50] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#315c43]"
              >
                Clear Meal Plan
              </button>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-5">
              <p className="text-sm text-[#68736a]">Planned Meals</p>
              <p className="mt-2 font-serif text-3xl">
                {selectedRecipeCount}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5">
              <p className="text-sm text-[#68736a]">Shopping Items</p>
              <p className="mt-2 font-serif text-3xl">
                {shoppingItems.length}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5">
              <p className="text-sm text-[#68736a]">Items Remaining</p>
              <p className="mt-2 font-serif text-3xl">
                {remainingCount}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Meal Planner */}
      <section className="mx-auto max-w-7xl px-5 py-14">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b47a3e]">
              Your weekly schedule
            </p>

            <h2 className="mt-2 font-serif text-3xl md:text-4xl">
              Plan Your Meals
            </h2>

            <p className="mt-2 text-sm text-[#68736a]">
              Choose a recipe for each meal of the day.
            </p>
          </div>

          <p className="text-sm text-[#68736a]">
            {!mounted || !loaded
              ? "Loading saved plan..."
              : saved
                ? "✓ Changes saved"
                : "Unable to save changes"}
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-[#f6f4eb] p-10 text-center">
            Loading recipes...
          </div>
        ) : recipes.length === 0 ? (
          <div className="rounded-2xl bg-[#f6f4eb] p-10 text-center">
            <p>No published recipes found.</p>

            <Link
              href="/recipes"
              className="mt-4 inline-block text-[#315c43] underline"
            >
              Browse recipes
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {days.map((day) => (
              <div
                key={day}
                className="rounded-2xl border border-[#e9e5da] bg-white p-5 md:p-6"
              >
                <h3 className="mb-5 font-serif text-2xl">{day}</h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {meals.map((meal) => {
                    const key = getMealKey(day, meal);
                    const selectedId = mealPlan[key] || "";

                    return (
                      <div
                        key={key}
                        className="rounded-xl bg-[#f6f4eb] p-4"
                      >
                        <label
                          htmlFor={key}
                          className="mb-3 block text-sm font-semibold text-[#456b50]"
                        >
                          {meal}
                        </label>

                        <select
                          id={key}
                          value={selectedId}
                          onChange={(event) => {
                            const value = event.target.value;

                            setMealPlan((previous) => {
                              const updated = { ...previous };

                              if (value) {
                                updated[key] = value;
                              } else {
                                delete updated[key];
                              }

                              return updated;
                            });
                          }}
                          className="w-full rounded-lg border border-[#deded3] bg-white px-3 py-3 text-sm outline-none focus:border-[#456b50]"
                        >
                          <option value="">Choose a recipe</option>

                          {recipes.map((recipe) => (
                            <option key={recipe._id} value={recipe._id}>
                              {recipe.title}
                            </option>
                          ))}
                        </select>

                        {selectedId && (
                          <button
                            type="button"
                            onClick={() => {
                              setMealPlan((previous) => {
                                const updated = { ...previous };
                                delete updated[key];
                                return updated;
                              });
                            }}
                            className="mt-3 text-xs font-medium text-red-600 hover:underline"
                          >
                            Remove meal
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Shopping List */}
      <section className="border-t border-[#e9e5da] bg-[#faf9f4] px-5 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b47a3e]">
              Shopping made simple
            </p>

            <h2 className="mt-2 font-serif text-3xl md:text-4xl">
              Your Shopping List
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#68736a]">
              Add only the ingredients you need from your meal plan.
              You can also add your regular shopping items separately.
            </p>
          </div>

          {/* Meal Plan Suggestions */}
          <div className="mb-8 rounded-2xl border border-[#e9e5da] bg-white p-5 md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-2xl">
                  Ingredients from Your Meal Plan
                </h3>

                <p className="mt-2 text-sm text-[#68736a]">
                  These are suggestions. Add only what you need to your list.
                </p>
              </div>

              {suggestions.length > 0 && (
                <button
                  type="button"
                  onClick={addAllSuggestions}
                  className="rounded-full border border-[#456b50] px-5 py-2.5 text-sm font-medium text-[#315c43] transition hover:bg-[#edf1e9]"
                >
                  Add All
                </button>
              )}
            </div>

            {suggestions.length === 0 ? (
              <div className="mt-6 rounded-xl bg-[#f6f4eb] p-6 text-center">
                <p className="font-medium">No ingredients yet</p>

                <p className="mt-2 text-sm text-[#68736a]">
                  Select recipes in your weekly meal planner to see ingredient
                  suggestions here.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {suggestions.map((ingredient, index) => {
                  const isAdded = shoppingItems.some(
                    (item) =>
                      item.name.toLowerCase() ===
                        ingredient.name.toLowerCase() &&
                      item.unit.toLowerCase() ===
                        ingredient.unit.toLowerCase()
                  );

                  return (
                    <div
                      key={`${ingredient.name}-${ingredient.unit}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-xl bg-[#f6f4eb] p-4"
                    >
                      <div className="min-w-0">
                        <p className="font-medium">{ingredient.name}</p>

                        {formatAmount(ingredient.amount, ingredient.unit) && (
                          <p className="mt-1 text-xs text-[#68736a]">
                            {formatAmount(ingredient.amount, ingredient.unit)}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => addSuggestion(ingredient)}
                        disabled={isAdded}
                        className="shrink-0 rounded-full bg-[#456b50] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#315c43] disabled:cursor-not-allowed disabled:bg-[#dce4dc] disabled:text-[#456b50]"
                      >
                        {isAdded ? "Added ✓" : "+ Add"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Manual Shopping Items */}
          <div className="mb-8 rounded-2xl border border-[#e9e5da] bg-white p-5 md:p-7">
            <h3 className="font-serif text-2xl">Other Shopping Items</h3>

            <p className="mt-2 text-sm text-[#68736a]">
              Add anything else you need, such as milk, bread, soap or
              household items.
            </p>

            <form
              onSubmit={addManualItem}
              className="mt-5 flex flex-col gap-3 sm:flex-row"
            >
              <input
                type="text"
                value={newItem}
                onChange={(event) => {
                  setNewItem(event.target.value);
                  setError("");
                }}
                placeholder="Enter an item (e.g. Milk)"
                maxLength={100}
                className="min-w-0 flex-1 rounded-xl border border-[#deded3] bg-[#fffdf8] px-4 py-3 text-sm outline-none focus:border-[#456b50]"
              />

              <button
                type="submit"
                className="rounded-full bg-[#456b50] px-7 py-3 text-sm font-medium text-white transition hover:bg-[#315c43]"
              >
                + Add Item
              </button>
            </form>

            {error && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {error}
              </p>
            )}
          </div>

          {/* Final Shopping List */}
          <div className="rounded-2xl border border-[#e9e5da] bg-white p-5 md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-2xl">My Shopping List</h3>

                <p className="mt-2 text-sm text-[#68736a]">
                  {checkedCount} completed · {remainingCount} remaining
                </p>
              </div>

              {shoppingItems.length > 0 && (
                <button
                  type="button"
                  onClick={clearShoppingList}
                  className="text-sm font-medium text-red-600 hover:underline"
                >
                  Clear List
                </button>
              )}
            </div>

            {shoppingItems.length === 0 ? (
              <div className="mt-6 rounded-xl bg-[#f6f4eb] p-8 text-center">
                <p className="font-serif text-xl">Your list is empty</p>

                <p className="mt-2 text-sm text-[#68736a]">
                  Add ingredients from your meal plan or enter your own
                  shopping items.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {shoppingItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-[#f6f4eb] px-4 py-3"
                  >
                    <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleChecked(item.id)}
                        className="h-5 w-5 accent-[#456b50]"
                      />

                      <span
                        className={`min-w-0 ${
                          item.checked
                            ? "text-[#899087] line-through"
                            : "text-[#26352c]"
                        }`}
                      >
                        <span className="font-medium">{item.name}</span>

                        {formatAmount(item.amount, item.unit) && (
                          <span className="ml-2 text-xs text-[#68736a]">
                            ({formatAmount(item.amount, item.unit)})
                          </span>
                        )}

                        <span className="ml-2 block text-xs text-[#899087] sm:inline">
                          {item.source === "meal"
                            ? "From meal plan"
                            : "Manual item"}
                        </span>
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => deleteShoppingItem(item.id)}
                      aria-label={`Delete ${item.name}`}
                      className="shrink-0 rounded-lg p-2 text-[#899087] transition hover:bg-red-50 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {shoppingItems.length > 0 && (
              <div className="mt-6">
                <div className="h-2 overflow-hidden rounded-full bg-[#e9e5da]">
                  <div
                    className="h-full rounded-full bg-[#456b50] transition-all"
                    style={{
                      width: `${completionPercentage}%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-right text-xs text-[#68736a]">
                  {completionPercentage}% completed
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e9e5da] px-5 py-8 text-center">
        <Link href="/" className="font-serif text-xl font-bold">
          Everyday<span className="text-[#b47a3e]">.</span>Kitchen
        </Link>

        <p className="mt-2 text-xs text-[#899087]">
          Plan your meals. Make cooking easier.
        </p>
      </footer>
    </main>
  );
}
