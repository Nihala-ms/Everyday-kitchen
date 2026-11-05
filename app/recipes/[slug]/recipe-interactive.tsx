
"use client";

import { useMemo, useState } from "react";
import { useRecipeServing } from "./recipe-serving-context";

interface Ingredient {
  amount: number | null;
  unit: string;
  name: string;
}

interface Instruction {
  title: string;
  description: string;
}

interface RecipeInteractiveProps {
  title: string;
  ingredients: Ingredient[];
  instructions: Instruction[];
  servings: number;
  prepTime: number;
  cookTime: number;
  totalTime: number;
}

function formatAmount(amount: number) {
  return Number.isInteger(amount)
    ? String(amount)
    : Number(amount.toFixed(2)).toString();
}

function formatTime(minutes: number) {
  if (!minutes || minutes <= 0) return "—";

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  if (hours && remaining) return `${hours} hr ${remaining} min`;
  if (hours) return `${hours} hr`;

  return `${minutes} min`;
}

export default function RecipeInteractive({
  title,
  ingredients,
  instructions,
  servings,
  prepTime,
  cookTime,
  totalTime,
}: RecipeInteractiveProps) {
  const { selectedServings, setSelectedServings } = useRecipeServing();

  const [checkedIngredients, setCheckedIngredients] = useState<number[]>([]);
  const [cookingMode, setCookingMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const scaledIngredients = useMemo(() => {
    const baseServings = servings || 4;

    return ingredients.map((ingredient) => ({
      ...ingredient,
      adjustedAmount:
        ingredient.amount === null
          ? null
          : (ingredient.amount * selectedServings) / baseServings,
    }));
  }, [ingredients, selectedServings, servings]);

  const ingredientProgress =
    ingredients.length > 0
      ? Math.round((checkedIngredients.length / ingredients.length) * 100)
      : 0;

  const cookingProgress =
    instructions.length > 0
      ? Math.round(((currentStep + 1) / instructions.length) * 100)
      : 0;

  function toggleIngredient(index: number) {
    setCheckedIngredients((previous) =>
      previous.includes(index)
        ? previous.filter((item) => item !== index)
        : [...previous, index]
    );
  }

  function closeCookingMode() {
    setCookingMode(false);
    setCurrentStep(0);
  }

  return (
    <>
      <div className="grid min-w-0 items-start gap-10 sm:gap-12 lg:grid-cols-[0.85fr_1.4fr] lg:gap-20">
        {/* Ingredients */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#e9e5d9] pb-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b47a3e]">
                What you need
              </p>

              <h3 className="mt-2 font-serif text-2xl font-bold text-[#26352c]">
                Ingredients
              </h3>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="min-h-10 text-sm font-semibold text-[#315c43] transition hover:text-[#b47a3e]"
            >
              Print recipe ↗
            </button>
          </div>

          {/* Serving calculator */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e9e5d9] py-5">
            <div>
              <p className="text-sm font-semibold text-[#315c43]">
                Adjust servings
              </p>

              <p className="mt-1 text-xs text-[#92978d]">
                Change ingredient quantities
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setSelectedServings((value) => Math.max(1, value - 1))
                }
                disabled={selectedServings <= 1}
                aria-label="Decrease servings"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d9dfd3] text-xl text-[#315c43] transition hover:bg-[#f0f2eb] disabled:opacity-40"
              >
                −
              </button>

              <span className="min-w-8 text-center text-sm font-bold text-[#315c43]">
                {selectedServings}
              </span>

              <button
                type="button"
                onClick={() =>
                  setSelectedServings((value) => Math.min(20, value + 1))
                }
                disabled={selectedServings >= 20}
                aria-label="Increase servings"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d9dfd3] text-xl text-[#315c43] transition hover:bg-[#f0f2eb] disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>

          {/* Ingredient progress */}
          <div className="py-5">
            <div className="mb-2 flex justify-between text-xs">
              <span className="text-[#92978d]">Ingredients prepared</span>

              <span className="font-semibold text-[#315c43]">
                {ingredientProgress}%
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-[#eee9df]">
              <div
                className="h-full rounded-full bg-[#315c43] transition-all"
                style={{ width: `${ingredientProgress}%` }}
              />
            </div>
          </div>

          {/* Ingredient checklist */}
          <div>
            {scaledIngredients.map((ingredient, index) => {
              const checked = checkedIngredients.includes(index);

              return (
                <label
                  key={`${ingredient.name}-${index}`}
                  className="flex cursor-pointer items-start gap-3 border-b border-[#eee9df] py-4 last:border-0"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleIngredient(index)}
                    className="mt-1 h-5 w-5 shrink-0 accent-[#315c43]"
                  />

                  <span
                    className={`min-w-0 break-words text-sm leading-6 ${
                      checked
                        ? "text-[#a0a59c] line-through"
                        : "text-[#59645a]"
                    }`}
                  >
                    <strong className="font-semibold text-[#315c43]">
                      {ingredient.adjustedAmount !== null
                        ? `${formatAmount(ingredient.adjustedAmount)} ${
                            ingredient.unit || ""
                          } `
                        : ingredient.unit
                          ? `${ingredient.unit} `
                          : ""}
                    </strong>

                    {ingredient.name}
                  </span>
                </label>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setCheckedIngredients([])}
            className="mt-4 min-h-10 text-xs font-semibold text-[#b47a3e] hover:underline"
          >
            Reset ingredient checklist
          </button>
        </div>

        {/* Instructions */}
        <div className="min-w-0">
          <div className="border-b border-[#e9e5d9] pb-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b47a3e]">
              How to prepare
            </p>

            <h3 className="mt-2 font-serif text-2xl font-bold text-[#26352c]">
              Instructions
            </h3>
          </div>

          <div className="mt-2">
            {instructions.map((step, index) => (
              <article
                key={index}
                className="grid grid-cols-[34px_minmax(0,1fr)] gap-3 border-b border-[#e9e5d9] py-6 sm:grid-cols-[42px_minmax(0,1fr)] sm:gap-4"
              >
                <span className="font-serif text-2xl font-bold text-[#c18a51]">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="min-w-0">
                  <h4 className="break-words text-base font-bold text-[#315c43]">
                    {step.title}
                  </h4>

                  <p className="mt-2 break-words text-sm leading-7 text-[#777d73]">
                    {step.description}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setCurrentStep(0);
              setCookingMode(true);
            }}
            disabled={instructions.length === 0}
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-[#315c43] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#244630] disabled:opacity-50 sm:w-auto sm:px-7"
          >
            Start Cooking Mode <span>→</span>
          </button>
        </div>
      </div>

      {/* Cooking mode */}
      {cookingMode && instructions.length > 0 && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#17271d]/90 p-3 sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cooking-title"
        >
          <div className="my-auto max-h-[94dvh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[#fffdf8] p-5 shadow-2xl sm:rounded-3xl sm:p-10">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-[#b47a3e]">
                  Cooking mode
                </p>

                <h2
                  id="cooking-title"
                  className="mt-2 break-words font-serif text-xl font-bold text-[#26352c] sm:text-2xl"
                >
                  {title}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeCookingMode}
                aria-label="Close cooking mode"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-3xl leading-none text-[#315c43] transition hover:bg-[#f0f2eb]"
              >
                ×
              </button>
            </div>

            <div className="mt-7">
              <div className="mb-3 flex justify-between text-xs text-[#777d73]">
                <span>Cooking progress</span>

                <span>
                  {currentStep + 1} / {instructions.length}
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-[#eee9df]">
                <div
                  className="h-full rounded-full bg-[#315c43] transition-all"
                  style={{ width: `${cookingProgress}%` }}
                />
              </div>
            </div>

            <div className="my-8 min-h-40 sm:my-10">
              <p className="text-xs font-bold uppercase tracking-widest text-[#b47a3e]">
                Step {currentStep + 1}
              </p>

              <h3 className="mt-4 break-words font-serif text-2xl font-bold text-[#26352c] sm:text-3xl">
                {instructions[currentStep].title}
              </h3>

              <p className="mt-5 break-words text-sm leading-7 text-[#777d73] sm:text-base sm:leading-8">
                {instructions[currentStep].description}
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[#e9e5d9] pt-5 sm:flex-row sm:justify-between sm:gap-4 sm:pt-6">
              <button
                type="button"
                onClick={() =>
                  setCurrentStep((step) => Math.max(0, step - 1))
                }
                disabled={currentStep === 0}
                className="min-h-12 rounded-full border border-[#315c43] px-6 py-3 text-sm font-semibold text-[#315c43] disabled:opacity-40"
              >
                ← Previous
              </button>

              {currentStep < instructions.length - 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setCurrentStep((step) =>
                      Math.min(instructions.length - 1, step + 1)
                    )
                  }
                  className="min-h-12 rounded-full bg-[#315c43] px-6 py-3 text-sm font-semibold text-white hover:bg-[#244630]"
                >
                  Next Step →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={closeCookingMode}
                  className="min-h-12 rounded-full bg-[#315c43] px-6 py-3 text-sm font-semibold text-white hover:bg-[#244630]"
                >
                  Finish Cooking ✓
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recipe time details */}
      <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-6 border-t border-[#e9e5d9] pt-7 sm:mt-14 sm:flex sm:flex-wrap sm:gap-x-10 sm:gap-y-5">
        <div>
          <p className="text-xs text-[#92978d]">Preparation</p>

          <p className="mt-1 text-sm font-semibold text-[#315c43]">
            {formatTime(prepTime)}
          </p>
        </div>

        <div>
          <p className="text-xs text-[#92978d]">Cooking</p>

          <p className="mt-1 text-sm font-semibold text-[#315c43]">
            {formatTime(cookTime)}
          </p>
        </div>

        <div>
          <p className="text-xs text-[#92978d]">Total time</p>

          <p className="mt-1 text-sm font-semibold text-[#315c43]">
            {formatTime(totalTime)}
          </p>
        </div>

        <div>
          <p className="text-xs text-[#92978d]">Servings</p>

          <p className="mt-1 text-sm font-semibold text-[#315c43]">
            {selectedServings} people
          </p>
        </div>
      </div>
    </>
  );
}
