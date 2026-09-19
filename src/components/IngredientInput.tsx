import React, { useState } from "react";
import { Plus, X, Sparkles, Refrigerator, Trash2 } from "lucide-react";

interface IngredientInputProps {
  ingredients: string[];
  onAddIngredient: (item: string) => void;
  onRemoveIngredient: (item: string) => void;
  onClearIngredients: () => void;
  disabled?: boolean;
}

const COMMON_SUGGESTIONS = [
  "Huevos",
  "Pechuga de pollo",
  "Espinacas",
  "Tomates",
  "Calabacín / Zucchini",
  "Brócoli",
  "Cebolla",
  "Pimiento",
  "Atún",
  "Champiñones",
  "Aguacate",
  "Zanahoria",
  "Carne magra",
  "Queso fresco / Panela",
];

export const IngredientInput: React.FC<IngredientInputProps> = ({
  ingredients,
  onAddIngredient,
  onRemoveIngredient,
  onClearIngredients,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputValue.trim();
    if (!clean) return;

    // Support comma-separated items
    if (clean.includes(",")) {
      const parts = clean.split(",").map((s) => s.trim()).filter(Boolean);
      parts.forEach((p) => onAddIngredient(p));
    } else {
      onAddIngredient(clean);
    }
    setInputValue("");
  };

  const handleSuggestionClick = (item: string) => {
    if (ingredients.some((i) => i.toLowerCase() === item.toLowerCase())) {
      onRemoveIngredient(item);
    } else {
      onAddIngredient(item);
    }
  };

  return (
    <div id="ingredient-input-container" className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200/80">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-medium">
            <Refrigerator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-stone-900">
              ¿Qué tienes en tu refrigerador?
            </h2>
            <p className="text-xs text-stone-500">
              Agrega los ingredientes frescos y proteínas que tengas a mano
            </p>
          </div>
        </div>

        {ingredients.length > 0 && (
          <button
            id="clear-ingredients-btn"
            type="button"
            onClick={onClearIngredients}
            disabled={disabled}
            className="text-xs text-stone-400 hover:text-red-500 flex items-center gap-1 transition-colors px-2 py-1 rounded"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Limpiar lista
          </button>
        )}
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          id="custom-ingredient-input"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={disabled}
          placeholder="Escribe un ingrediente (ej: pechuga de pollo, coliflor, pepino...)"
          className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all text-stone-900 placeholder:text-stone-400"
        />
        <button
          id="add-ingredient-btn"
          type="submit"
          disabled={disabled || !inputValue.trim()}
          className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-200 disabled:text-stone-400 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir</span>
        </button>
      </form>

      {/* Selected tags */}
      {ingredients.length > 0 ? (
        <div className="mb-5">
          <span className="text-xs font-medium text-stone-500 block mb-2">
            Ingredientes seleccionados ({ingredients.length}):
          </span>
          <div className="flex flex-wrap gap-2">
            {ingredients.map((item) => (
              <span
                key={item}
                id={`ingredient-tag-${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-medium rounded-lg animate-in fade-in zoom-in-95 duration-150"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => onRemoveIngredient(item)}
                  disabled={disabled}
                  aria-label={`Eliminar ${item}`}
                  className="w-4 h-4 rounded hover:bg-emerald-200/60 text-emerald-700 flex items-center justify-center transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-3 bg-stone-50 border border-dashed border-stone-200 rounded-xl text-center text-xs text-stone-500 mb-4">
          Aún no has agregado ingredientes. Elige algunos de los accesos rápidos o escribe los tuyos arriba.
        </div>
      )}

      {/* Quick suggestions */}
      <div>
        <div className="flex items-center gap-1.5 mb-2 text-xs font-medium text-stone-500">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Frecuentes en el refrigerador (toca para agregar/quitar):</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_SUGGESTIONS.map((item) => {
            const isSelected = ingredients.some(
              (i) => i.toLowerCase() === item.toLowerCase()
            );
            return (
              <button
                key={item}
                id={`quick-suggestion-${item.toLowerCase().replace(/\s+/g, "-")}`}
                type="button"
                onClick={() => handleSuggestionClick(item)}
                disabled={disabled}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                  isSelected
                    ? "bg-emerald-600 border-emerald-600 text-white font-medium shadow-xs"
                    : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100 hover:border-stone-300"
                }`}
              >
                {isSelected ? "✓ " : "+ "}
                {item}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
