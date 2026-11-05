
"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";

interface RecipeServingContextType {
  selectedServings: number;
  setSelectedServings: Dispatch<SetStateAction<number>>;
}

const RecipeServingContext =
  createContext<RecipeServingContextType | null>(null);

export function RecipeServingProvider({
  initialServings,
  children,
}: {
  initialServings: number;
  children: ReactNode;
}) {
  const [selectedServings, setSelectedServings] = useState(
    initialServings || 4
  );

  return (
    <RecipeServingContext.Provider
      value={{ selectedServings, setSelectedServings }}
    >
      {children}
    </RecipeServingContext.Provider>
  );
}

export function useRecipeServing() {
  const context = useContext(RecipeServingContext);

  if (!context) {
    throw new Error(
      "useRecipeServing must be used inside RecipeServingProvider"
    );
  }

  return context;
}

function formatTime(minutes: number) {
  if (!minutes || minutes <= 0) return "—";

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  if (hours && remaining) return `${hours} hr ${remaining} min`;
  if (hours) return `${hours} hr`;

  return `${minutes} min`;
}

export function RecipeSummary({
  prepTime,
  cookTime,
  totalTime,
}: {
  prepTime: number;
  cookTime: number;
  totalTime: number;
}) {
  const { selectedServings } = useRecipeServing();

  return (
    <div className="mx-auto mt-7 grid max-w-4xl grid-cols-2 gap-x-4 gap-y-6 border-y border-[#e9e5d9] py-6 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-10 sm:gap-y-5">
      <div className="text-center">
        <p className="text-xs text-[#92978d]">Prep time</p>
        <p className="mt-1 text-sm font-semibold text-[#315c43]">
          {formatTime(prepTime)}
        </p>
      </div>

      <div className="text-center">
        <p className="text-xs text-[#92978d]">Cook time</p>
        <p className="mt-1 text-sm font-semibold text-[#315c43]">
          {formatTime(cookTime)}
        </p>
      </div>

      <div className="text-center">
        <p className="text-xs text-[#92978d]">Total time</p>
        <p className="mt-1 text-sm font-semibold text-[#315c43]">
          {formatTime(totalTime)}
        </p>
      </div>

      <div className="text-center">
        <p className="text-xs text-[#92978d]">Servings</p>
        <p className="mt-1 text-sm font-semibold text-[#315c43]">
          {selectedServings} people
        </p>
      </div>
    </div>
  );
}
