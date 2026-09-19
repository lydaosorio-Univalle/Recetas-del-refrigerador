export interface Recipe {
  id: string;
  title: string;
  prepTime: string;
  servings: string;
  difficulty: 'Fácil' | 'Medio';
  summary: string;
  ingredientsUsed: string[];
  pantryItems: string[];
  instructions: string[];
  nutritionHighlights: {
    proteinInfo: string;
    carbsSugarInfo: string;
    sodiumInfo: string;
  };
  chefTip: string;
  createdAt: number;
}

export interface GenerateRecipeRequest {
  ingredients: string[];
  mealType?: string;
  timeAvailable?: string;
  avoidIngredients?: string[];
}
