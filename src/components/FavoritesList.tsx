import React, { useState } from "react";
import { Recipe } from "../types";
import {
  Heart,
  Clock,
  Users,
  Trash2,
  ChevronRight,
  Search,
  Salad,
  Calendar,
} from "lucide-react";

interface FavoritesListProps {
  favorites: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  onRemoveFavorite: (id: string) => void;
  onGoToGenerator: () => void;
}

export const FavoritesList: React.FC<FavoritesListProps> = ({
  favorites,
  onSelectRecipe,
  onRemoveFavorite,
  onGoToGenerator,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = favorites.filter((r) => {
    const q = searchTerm.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.summary.toLowerCase().includes(q) ||
      r.ingredientsUsed.some((i) => i.toLowerCase().includes(q))
    );
  });

  if (favorites.length === 0) {
    return (
      <div
        id="empty-favorites-view"
        className="bg-white rounded-2xl p-8 md:p-12 text-center border border-stone-200/80 shadow-sm max-w-xl mx-auto"
      >
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-stone-900 mb-2 font-serif">
          Aún no tienes recetas favoritas guardadas
        </h3>
        <p className="text-sm text-stone-600 mb-6 leading-relaxed">
          Cuando generes una receta con los ingredientes de tu refrigerador y te encante, presiona el botón "Guardar favorita" para tenerla siempre a la mano.
        </p>
        <button
          id="go-to-generator-btn"
          type="button"
          onClick={onGoToGenerator}
          className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-medium transition-colors shadow-xs"
        >
          <Salad className="w-4 h-4 text-emerald-400" />
          <span>Generar mi primera receta</span>
        </button>
      </div>
    );
  }

  return (
    <div id="favorites-container" className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-stone-900 font-serif">
              Mis Recetas Favoritas ({favorites.length})
            </h2>
            <p className="text-xs text-stone-500">
              Tus platos saludables guardados para cocinar una y otra vez
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              id="search-favorites-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o ingrediente..."
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 text-stone-900 placeholder:text-stone-400"
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-stone-200 text-stone-500 text-sm">
          No se encontraron recetas que coincidan con "{searchTerm}".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((recipe) => (
            <div
              key={recipe.id}
              id={`favorite-card-${recipe.id}`}
              className="group bg-white rounded-2xl p-5 border border-stone-200 hover:border-stone-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                    Baja en sal & rica en proteína
                  </span>
                  <button
                    id={`remove-fav-btn-${recipe.id}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFavorite(recipe.id);
                    }}
                    title="Eliminar de favoritas"
                    aria-label={`Eliminar ${recipe.title}`}
                    className="text-stone-400 hover:text-rose-500 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3
                  onClick={() => onSelectRecipe(recipe)}
                  className="font-bold text-stone-900 text-lg group-hover:text-emerald-800 transition-colors cursor-pointer font-serif mb-2"
                >
                  {recipe.title}
                </h3>

                <p className="text-xs text-stone-600 line-clamp-2 mb-4 leading-relaxed">
                  {recipe.summary}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mb-4 pt-3 border-t border-stone-100">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    {recipe.prepTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-emerald-600" />
                    {recipe.servings}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    {new Date(recipe.createdAt).toLocaleDateString("es-ES", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] text-stone-400">
                  {recipe.ingredientsUsed.length} ingredientes
                </div>
                <button
                  type="button"
                  onClick={() => onSelectRecipe(recipe)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 group-hover:translate-x-0.5 transition-all"
                >
                  <span>Ver receta completa</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
