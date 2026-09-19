import React, { useState, useEffect } from "react";
import { Recipe } from "./types";
import { IngredientInput } from "./components/IngredientInput";
import { RecipeCard } from "./components/RecipeCard";
import { FavoritesList } from "./components/FavoritesList";
import {
  Utensils,
  Heart,
  Sparkles,
  Salad,
  ShieldAlert,
  Clock,
  CheckCircle2,
  ChefHat,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

const STORAGE_KEY = "refrigerator_favorite_recipes_v1";

const DEFAULT_STARTER_INGREDIENTS = [
  "Pechuga de pollo",
  "Huevos",
  "Espinacas",
  "Tomates",
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"generator" | "favorites">("generator");
  const [ingredients, setIngredients] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("refrigerator_current_ingredients");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_STARTER_INGREDIENTS;
  });

  const [favorites, setFavorites] = useState<Recipe[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error loading favorites from storage", e);
    }
    return [];
  });

  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [viewingFavoriteRecipe, setViewingFavoriteRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Optional quick criteria
  const [mealType, setMealType] = useState("Cualquiera");
  const [timeAvailable, setTimeAvailable] = useState("Cualquiera");

  // Save ingredients to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("refrigerator_current_ingredients", JSON.stringify(ingredients));
    } catch (e) {
      // ignore
    }
  }, [ingredients]);

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error("Error saving favorites to storage", e);
    }
  }, [favorites]);

  const handleAddIngredient = (item: string) => {
    const trimmed = item.trim();
    if (!trimmed) return;
    if (ingredients.some((i) => i.toLowerCase() === trimmed.toLowerCase())) return;
    setIngredients((prev) => [...prev, trimmed]);
  };

  const handleRemoveIngredient = (item: string) => {
    setIngredients((prev) =>
      prev.filter((i) => i.toLowerCase() !== item.toLowerCase())
    );
  };

  const handleClearIngredients = () => {
    setIngredients([]);
  };

  const handleToggleFavorite = (recipe: Recipe) => {
    const exists = favorites.some((f) => f.id === recipe.id);
    if (exists) {
      setFavorites((prev) => prev.filter((f) => f.id !== recipe.id));
    } else {
      setFavorites((prev) => [recipe, ...prev]);
    }
  };

  const handleGenerateRecipe = async () => {
    if (ingredients.length === 0) {
      setError("Por favor agrega al menos un ingrediente de tu refrigerador.");
      return;
    }

    setLoading(true);
    setError(null);
    setViewingFavoriteRecipe(null);

    try {
      const res = await fetch("/api/generate-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ingredients,
          mealType: mealType !== "Cualquiera" ? mealType : undefined,
          timeAvailable: timeAvailable !== "Cualquiera" ? timeAvailable : undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "No se pudo generar la receta.");
      }

      const data = await res.json();
      if (data.recipe) {
        setCurrentRecipe(data.recipe);
        // Scroll smoothly to recipe
        setTimeout(() => {
          document.getElementById("recipe-result-anchor")?.scrollIntoView({
            behavior: "smooth",
          });
        }, 100);
      } else {
        throw new Error("Formato de receta no válido.");
      }
    } catch (err: any) {
      console.error("Error generating recipe:", err);
      setError(err.message || "Error al conectar con el asistente de cocina.");
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = (recipeId: string) => {
    return favorites.some((f) => f.id === recipeId);
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-stone-900 pb-16">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-stone-900 leading-tight">
                Recetas del Refrigerador
              </h1>
              <span className="text-[11px] text-emerald-800 font-medium hidden sm:inline-block">
                Alta en proteína & verduras • Baja en carbohidratos y sal
              </span>
            </div>
          </div>

          {/* View switcher */}
          <nav className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200/60">
            <button
              id="tab-generator-btn"
              type="button"
              onClick={() => {
                setActiveTab("generator");
                setViewingFavoriteRecipe(null);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "generator" && !viewingFavoriteRecipe
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Utensils className="w-3.5 h-3.5 text-emerald-600" />
              <span>Generar</span>
            </button>

            <button
              id="tab-favorites-btn"
              type="button"
              onClick={() => {
                setActiveTab("favorites");
                setViewingFavoriteRecipe(null);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "favorites" || viewingFavoriteRecipe
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  favorites.length > 0 ? "text-rose-500 fill-rose-500" : "text-stone-400"
                }`}
              />
              <span>Mis Favoritas</span>
              {favorites.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold flex items-center justify-center ml-0.5">
                  {favorites.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        {/* If viewing a single favorite recipe */}
        {viewingFavoriteRecipe ? (
          <div className="space-y-4">
            <button
              id="back-to-favorites-btn"
              type="button"
              onClick={() => setViewingFavoriteRecipe(null)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white border border-stone-200 px-3.5 py-2 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a mis recetas favoritas</span>
            </button>

            <RecipeCard
              recipe={viewingFavoriteRecipe}
              isFavorite={isFavorite(viewingFavoriteRecipe.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        ) : activeTab === "favorites" ? (
          /* Favorites Tab */
          <FavoritesList
            favorites={favorites}
            onSelectRecipe={(rec) => setViewingFavoriteRecipe(rec)}
            onRemoveFavorite={(id) => {
              setFavorites((prev) => prev.filter((f) => f.id !== id));
            }}
            onGoToGenerator={() => setActiveTab("generator")}
          />
        ) : (
          /* Generator Tab */
          <div className="space-y-6">
            {/* Nutritional Promise Badge Bar */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-900">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold">
                  Tus pautas nutricionales activas para cada receta:
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-emerald-800">
                <span className="bg-white/80 px-2 py-0.5 rounded-md border border-emerald-200">
                  🍗 Proteínas prioritarias
                </span>
                <span className="bg-white/80 px-2 py-0.5 rounded-md border border-emerald-200">
                  🥦 Verduras frescas
                </span>
                <span className="bg-white/80 px-2 py-0.5 rounded-md border border-emerald-200">
                  🌿 Baja sal y sin azúcar
                </span>
                <span className="bg-white/80 px-2 py-0.5 rounded-md border border-emerald-200">
                  🥑 Baja en carbohidratos
                </span>
              </div>
            </div>

            {/* Input Component */}
            <IngredientInput
              ingredients={ingredients}
              onAddIngredient={handleAddIngredient}
              onRemoveIngredient={handleRemoveIngredient}
              onClearIngredients={handleClearIngredients}
              disabled={loading}
            />

            {/* Optional Preferences Filter Box */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="grid grid-cols-2 gap-4 w-full sm:w-auto">
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                    Momento del día
                  </label>
                  <select
                    id="meal-type-select"
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                    disabled={loading}
                    className="w-full text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                  >
                    <option value="Cualquiera">Cualquiera (Automático)</option>
                    <option value="Desayuno nutritivo">Desayuno</option>
                    <option value="Almuerzo / Comida principal">Almuerzo / Comida</option>
                    <option value="Cena ligera">Cena ligera</option>
                    <option value="Snack proteico">Snack rápido</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                    Tiempo estimado
                  </label>
                  <select
                    id="time-available-select"
                    value={timeAvailable}
                    onChange={(e) => setTimeAvailable(e.target.value)}
                    disabled={loading}
                    className="w-full text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                  >
                    <option value="Cualquiera">Sin prisa</option>
                    <option value="menos de 15 minutos">Rápido (~15 min)</option>
                    <option value="20 a 30 minutos">Estándar (~25 min)</option>
                    <option value="40 a 50 minutos">Elaborado (~45 min)</option>
                  </select>
                </div>
              </div>

              {/* Generate Button */}
              <button
                id="generate-recipe-btn"
                type="button"
                onClick={handleGenerateRecipe}
                disabled={loading || ingredients.length === 0}
                className="w-full sm:w-auto sm:self-end px-7 py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-200 disabled:text-stone-400 text-white rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Creando tu receta...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>Crear Receta Saludable</span>
                  </>
                )}
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold mb-0.5">No pudimos generar la receta</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Loading Indicator Placeholder */}
            {loading && (
              <div
                id="recipe-loading-state"
                className="bg-white rounded-2xl p-10 border border-stone-200 text-center shadow-sm space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto animate-pulse">
                  <Utensils className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 font-serif mb-1">
                    Diseñando tu receta saludable...
                  </h3>
                  <p className="text-xs text-stone-500 max-w-md mx-auto">
                    Combinando tus {ingredients.length} ingredientes con técnicas culinarias que realzan el sabor natural sin sal ni azúcar añadida.
                  </p>
                </div>
                <div className="flex justify-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                </div>
              </div>
            )}

            {/* Anchor for scroll */}
            <div id="recipe-result-anchor" />

            {/* Recipe Result Card */}
            {currentRecipe && !loading && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs text-stone-500 px-1">
                  <span className="font-medium text-emerald-800">
                    ✨ Receta recién creada a la medida de tu refrigerador
                  </span>
                </div>
                <RecipeCard
                  recipe={currentRecipe}
                  isFavorite={isFavorite(currentRecipe.id)}
                  onToggleFavorite={handleToggleFavorite}
                  onRegenerateVariant={handleGenerateRecipe}
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
