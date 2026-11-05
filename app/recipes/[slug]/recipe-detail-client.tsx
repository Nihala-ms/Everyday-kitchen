
"use client";

import { useState } from "react";
import Link from "next/link";

type Ingredient = {
  amount: number | null;
  unit: string;
  name: string;
};

type Instruction = {
  title: string;
  description: string;
};

type RecipeData = {
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
  ingredients: Ingredient[];
  instructions: Instruction[];
  tips: string[];
};

function formatAmount(amount: number) {
  return Number.isInteger(amount)
    ? String(amount)
    : Number(amount.toFixed(2)).toString();
}

export default function RecipeDetailClient({
  recipe,
}: {
  recipe: RecipeData;
}) {
  const [servings, setServings] = useState(recipe.servings || 4);
  const [cookingMode, setCookingMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [checkedIngredients, setCheckedIngredients] = useState<number[]>([]);

  const scaledIngredients = recipe.ingredients.map((ingredient) => {
    if (ingredient.amount === null || !recipe.servings) {
      return ingredient;
    }

    return {
      ...ingredient,
      amount: (ingredient.amount / recipe.servings) * servings,
    };
  });

  const toggleIngredient = (index: number) => {
    setCheckedIngredients((previous) =>
      previous.includes(index)
        ? previous.filter((item) => item !== index)
        : [...previous, index]
    );
  };

  const startCooking = () => {
    setCurrentStep(0);
    setCookingMode(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-[#fffaf4] pb-16">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-orange-600">
            Home
          </Link>
          <span>/</span>
          <Link href="/recipes" className="hover:text-orange-600">
            Recipes
          </Link>
          <span>/</span>
          <span className="font-medium text-gray-800">
            {recipe.title}
          </span>
        </div>

        {cookingMode ? (
          <section className="mx-auto max-w-3xl rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-10">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
                  Cooking Mode
                </p>
                <h1 className="mt-1 text-2xl font-bold text-gray-900">
                  {recipe.title}
                </h1>
              </div>

              <button
                onClick={() => setCookingMode(false)}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Exit
              </button>
            </div>

            <div className="mb-6 h-2 overflow-hidden rounded-full bg-orange-100">
              <div
                className="h-full rounded-full bg-orange-500 transition-all"
                style={{
                  width: `${
                    ((currentStep + 1) / recipe.instructions.length) * 100
                  }%`,
                }}
              />
            </div>

            <p className="mb-3 text-sm font-medium text-gray-500">
              Step {currentStep + 1} of {recipe.instructions.length}
            </p>

            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              {recipe.instructions[currentStep]?.title}
            </h2>

            <p className="min-h-28 whitespace-pre-line text-lg leading-8 text-gray-700">
              {recipe.instructions[currentStep]?.description}
            </p>

            <div className="mt-8 flex flex-wrap justify-between gap-3">
              <button
                onClick={() =>
                  setCurrentStep((step) => Math.max(0, step - 1))
                }
                disabled={currentStep === 0}
                className="rounded-full border border-gray-300 px-6 py-3 font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              {currentStep < recipe.instructions.length - 1 ? (
                <button
                  onClick={() =>
                    setCurrentStep((step) => step + 1)
                  }
                  className="rounded-full bg-orange-500 px-7 py-3 font-semibold text-white hover:bg-orange-600"
                >
                  Next Step
                </button>
              ) : (
                <button
                  onClick={() => setCookingMode(false)}
                  className="rounded-full bg-green-600 px-7 py-3 font-semibold text-white hover:bg-green-700"
                >
                  Finish Cooking
                </button>
              )}
            </div>
          </section>
        ) : (
          <>
            <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div className="overflow-hidden rounded-3xl bg-orange-100">
                <img
                  src={recipe.image}
                  alt={recipe.imageAlt}
                  className="h-72 w-full object-cover sm:h-96"
                />
              </div>

              <div>
                <span className="inline-block rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
                  {recipe.category}
                </span>

                <h1 className="mt-4 text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl">
                  {recipe.title}
                </h1>

                <p className="mt-4 leading-7 text-gray-600">
                  {recipe.description}
                </p>

                <p className="mt-4 text-sm font-medium text-gray-500">
                  {recipe.cuisine} Cuisine
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Info label="Prep Time" value={`${recipe.prepTime} min`} />
                  <Info label="Cook Time" value={`${recipe.cookTime} min`} />
                  <Info label="Total Time" value={`${recipe.totalTime} min`} />
                  <Info label="Servings" value={`${recipe.servings}`} />
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    onClick={startCooking}
                    disabled={!recipe.instructions.length}
                    className="rounded-full bg-orange-500 px-6 py-3 font-semibold text-white shadow-sm hover:bg-orange-600 disabled:opacity-50"
                  >
                    Start Cooking
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="rounded-full border border-orange-300 px-6 py-3 font-semibold text-orange-700 hover:bg-orange-50"
                  >
                    Print Recipe
                  </button>
                </div>
              </div>
            </section>

            <section className="mt-12 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Ingredients
                  </h2>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        setServings((value) => Math.max(1, value - 1))
                      }
                      aria-label="Decrease servings"
                      className="h-9 w-9 rounded-full border border-gray-300 text-lg font-bold hover:bg-gray-50"
                    >
                      −
                    </button>

                    <span className="min-w-20 text-center text-sm font-semibold text-gray-700">
                      {servings} servings
                    </span>

                    <button
                      onClick={() =>
                        setServings((value) => Math.min(30, value + 1))
                      }
                      aria-label="Increase servings"
                      className="h-9 w-9 rounded-full border border-gray-300 text-lg font-bold hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                <p className="mt-2 text-sm text-gray-500">
                  Change servings to calculate ingredient quantities.
                </p>

                <ul className="mt-6 space-y-4">
                  {scaledIngredients.map((ingredient, index) => (
                    <li key={index}>
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          checked={checkedIngredients.includes(index)}
                          onChange={() => toggleIngredient(index)}
                          className="mt-1 h-4 w-4 accent-orange-500"
                        />

                        <span
                          className={`leading-6 text-gray-700 ${
                            checkedIngredients.includes(index)
                              ? "text-gray-400 line-through"
                              : ""
                          }`}
                        >
                          <strong className="font-semibold text-gray-900">
                            {ingredient.amount !== null
                              ? `${formatAmount(ingredient.amount)} ${
                                  ingredient.unit || ""
                                } `
                              : ""}
                          </strong>
                          {ingredient.name}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>

                {recipe.ingredients.length === 0 && (
                  <p className="mt-5 text-gray-500">
                    Ingredients have not been added yet.
                  </p>
                )}
              </div>

              <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900">
                  Instructions
                </h2>

                <div className="mt-6 space-y-6">
                  {recipe.instructions.map((step, index) => (
                    <div key={index} className="flex gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-700">
                        {index + 1}
                      </span>

                      <div>
                        <h3 className="font-bold text-gray-900">
                          {step.title}
                        </h3>
                        <p className="mt-2 whitespace-pre-line leading-7 text-gray-600">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {recipe.instructions.length === 0 && (
                  <p className="mt-5 text-gray-500">
                    Instructions have not been added yet.
                  </p>
                )}
              </div>
            </section>

            {recipe.tips?.length > 0 && (
              <section className="mt-8 rounded-3xl border border-yellow-200 bg-yellow-50 p-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Kitchen Tips
                </h2>

                <ul className="mt-4 list-inside list-disc space-y-2 text-gray-700">
                  {recipe.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </section>
            )}

            <div className="mt-10 text-center">
              <Link
                href="/recipes"
                className="font-semibold text-orange-700 hover:text-orange-800"
              >
                ← Explore More Recipes
              </Link>
            </div>
          </>
        )}
      </div>

      <style jsx global>{`
        @media print {
          header,
          footer,
          nav,
          button,
          a {
            display: none !important;
          }

          body,
          main {
            background: white !important;
          }

          main {
            padding: 0 !important;
          }

          img {
            max-height: 280px !important;
            object-fit: contain !important;
          }

          section {
            break-inside: avoid;
            box-shadow: none !important;
          }
        }
      `}</style>
    </main>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-3 text-center shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 font-bold text-gray-900">{value}</p>
    </div>
  );
}
