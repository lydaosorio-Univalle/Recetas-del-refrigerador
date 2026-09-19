import React, { useState } from "react";
import { Recipe } from "../types";
import {
  Heart,
  Clock,
  Users,
  CheckCircle2,
  Copy,
  Check,
  Flame,
  Salad,
  Sparkles,
  ShieldCheck,
  Share2,
} from "lucide-react";

interface RecipeCardProps {
  recipe: Recipe;
  isFavorite: boolean;
  onToggleFavorite: (recipe: Recipe) => void;
  onRegenerateVariant?: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  isFavorite,
  onToggleFavorite,
  onRegenerateVariant,
}) => {
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);

  const toggleIngredient = (idx: number) => {
    setCheckedIngredients((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleStep = (idx: number) => {
    setCheckedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleCopy = () => {
    const text = `🥗 ${recipe.title}
⏱ Tiempo: ${recipe.prepTime} | 👥 Porciones: ${recipe.servings}

${recipe.summary}

📝 INGREDIENTES:
${recipe.ingredientsUsed.map((i) => `• ${i}`).join("\n")}
${recipe.pantryItems.length > 0 ? `\n🧂 DESPENSA BÁSICA:\n${recipe.pantryItems.map((p) => `• ${p}`).join("\n")}` : ""}

👨‍🍳 PREPARACIÓN:
${recipe.instructions.map((step, i) => `${i + 1}. ${step}`).join("\n")}

💡 CONSEJO DEL CHEF:
${recipe.chefTip}

🌱 INFORMACIÓN SALUDABLE:
• Proteína: ${recipe.nutritionHighlights.proteinInfo}
• Carbohidratos/Azúcares: ${recipe.nutritionHighlights.carbsSugarInfo}
• Sodio: ${recipe.nutritionHighlights.sodiumInfo}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  return (
    <article
      id={`recipe-card-${recipe.id}`}
      className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden transition-all"
    >
      {/* Top Banner with Health Badges */}
      <div className="bg-stone-900 text-stone-100 p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Salad className="w-3.5 h-3.5" />
              Alta en Proteínas & Verduras
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Baja en Sal & Sin Azúcar
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id={`toggle-favorite-btn-${recipe.id}`}
              type="button"
              onClick={() => onToggleFavorite(recipe)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                isFavorite
                  ? "bg-rose-500 text-white shadow-xs hover:bg-rose-600"
                  : "bg-stone-800 text-stone-200 hover:bg-stone-700 border border-stone-700"
              }`}
            >
              <Heart
                className={`w-4 h-4 transition-transform ${
                  isFavorite ? "fill-current scale-110" : ""
                }`}
              />
              <span>{isFavorite ? "Guardada en favoritas" : "Guardar favorita"}</span>
            </button>

            <button
              id="copy-recipe-btn"
              type="button"
              onClick={handleCopy}
              className="p-1.5 bg-stone-800 text-stone-200 hover:bg-stone-700 border border-stone-700 rounded-xl text-xs transition-colors"
              title="Copiar receta al portapapeles"
              aria-label="Copiar receta"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-3 font-serif">
          {recipe.title}
        </h1>

        <p className="text-stone-300 text-sm md:text-base leading-relaxed mb-6 max-w-3xl">
          {recipe.summary}
        </p>

        {/* Quick Meta Row */}
        <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-stone-300 pt-4 border-t border-stone-800">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Tiempo: <strong className="text-white font-medium">{recipe.prepTime}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Porciones: <strong className="text-white font-medium">{recipe.servings}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-emerald-400" />
            <span>Dificultad: <strong className="text-white font-medium">{recipe.difficulty}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="p-6 md:p-8 space-y-8">
        {/* Nutrition Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block mb-1">
              🥩 Proteína
            </span>
            <p className="text-xs text-emerald-800 leading-relaxed">
              {recipe.nutritionHighlights.proteinInfo}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-100">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block mb-1">
              🥬 Carbohidratos & Azúcar
            </span>
            <p className="text-xs text-amber-800 leading-relaxed">
              {recipe.nutritionHighlights.carbsSugarInfo}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-100 border border-stone-200">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-1">
              🌿 Sabor sin Exceso de Sal
            </span>
            <p className="text-xs text-stone-700 leading-relaxed">
              {recipe.nutritionHighlights.sodiumInfo}
            </p>
          </div>
        </div>

        {/* Two Columns: Ingredients & Instructions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Ingredients */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <span>Ingredientes del Refrigerador</span>
                </h3>
                <span className="text-xs text-stone-400">Toca para tachar</span>
              </div>

              <ul className="space-y-2">
                {recipe.ingredientsUsed.map((ing, idx) => {
                  const isChecked = checkedIngredients[idx];
                  return (
                    <li
                      key={idx}
                      onClick={() => toggleIngredient(idx)}
                      className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                        isChecked
                          ? "bg-stone-50 text-stone-400 line-through"
                          : "hover:bg-emerald-50/50 text-stone-800"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!!isChecked}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className="text-sm font-medium leading-snug">{ing}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {recipe.pantryItems && recipe.pantryItems.length > 0 && (
              <div className="pt-4 border-t border-stone-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  Básicos de Despensa Sugeridos
                </h4>
                <ul className="space-y-1.5">
                  {recipe.pantryItems.map((pantry, pIdx) => (
                    <li key={pIdx} className="text-xs text-stone-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-300 shrink-0" />
                      <span>{pantry}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column: Step-by-Step Instructions */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-stone-900">
                Paso a Paso de Preparación
              </h3>
              <span className="text-xs text-stone-400">
                {Object.values(checkedSteps).filter(Boolean).length} de {recipe.instructions.length} completados
              </span>
            </div>

            <ol className="space-y-3">
              {recipe.instructions.map((step, sIdx) => {
                const isChecked = checkedSteps[sIdx];
                return (
                  <li
                    key={sIdx}
                    onClick={() => toggleStep(sIdx)}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isChecked
                        ? "bg-stone-50 border-stone-200 text-stone-400"
                        : "bg-white border-stone-200/90 hover:border-stone-300 text-stone-800 shadow-xs"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        isChecked
                          ? "bg-stone-200 text-stone-500"
                          : "bg-emerald-600 text-white"
                      }`}
                    >
                      {isChecked ? <Check className="w-3.5 h-3.5" /> : sIdx + 1}
                    </div>
                    <div className="text-sm leading-relaxed pt-0.5">
                      <p className={isChecked ? "line-through" : ""}>{step}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        {/* Chef's Seasoning Tip Box */}
        {recipe.chefTip && (
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/70 flex items-start gap-3 text-amber-950">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                Consejo de Sazón Saludable del Chef
              </h4>
              <p className="text-xs text-amber-900/90 leading-relaxed">
                {recipe.chefTip}
              </p>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-200">
          <button
            id="toggle-favorite-bottom-btn"
            type="button"
            onClick={() => onToggleFavorite(recipe)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              isFavorite
                ? "bg-rose-50 text-rose-700 border border-rose-200"
                : "bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200"
            }`}
          >
            <Heart
              className={`w-4 h-4 ${
                isFavorite ? "fill-rose-600 text-rose-600" : "text-stone-600"
              }`}
            />
            <span>{isFavorite ? "Guardada en tus favoritas" : "Guardar en mis favoritas"}</span>
          </button>

          {onRegenerateVariant && (
            <button
              id="regenerate-variant-btn"
              type="button"
              onClick={onRegenerateVariant}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Probar otra idea con estos ingredientes</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
