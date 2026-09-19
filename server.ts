import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("La clave GEMINI_API_KEY no está configurada.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Recipe generation API endpoint
  app.post("/api/generate-recipe", async (req, res) => {
    try {
      const { ingredients, mealType, timeAvailable } = req.body;

      if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({
          error: "Por favor proporciona al menos un ingrediente de tu refrigerador.",
        });
      }

      const ai = getGeminiClient();

      const prompt = `Crea una receta culinaria deliciosa, práctica y saludable usando los siguientes ingredientes disponibles en el refrigerador:
Ingredientes en el refrigerador: ${ingredients.join(", ")}.
${mealType ? `Tipo de comida deseada: ${mealType}.` : ""}
${timeAvailable ? `Tiempo disponible aproximado: ${timeAvailable}.` : ""}

REGLAS NUTRICIONALES Y DE SALUD OBLIGATORIAS:
1. ALTA EN PROTEÍNA: Aprovecha o prioriza fuentes de proteína disponibles (huevos, pollo, carnes, pescados, legumbres, tofu, lácteos proteicos).
2. RICA EN VERDURAS FRESCAS: Resalta y maximiza las verduras u hortalizas provistas.
3. BAJA EN CARBOHIDRATOS: Evita azúcares refinados, harinas blancas o exceso de almidones.
4. BAJA EN SAL Y SIN AZÚCAR AÑADIDA: El sabor debe provenir de hierbas, ajo, cebolla, especias naturales, limón o vinagre, manteniendo el sodio al mínimo y cero azúcares añadidos.
5. FÁCIL Y REALISTA: Solo asume condimentos básicos de despensa como aceite de oliva, pimienta negra, agua o hierbas secas.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "Eres un chef profesional y nutricionista especializado en cocina saludable, baja en sodio, sin azúcares y baja en carbohidratos (low-carb), con un enfoque en proteínas limpias y vegetales frescos. Responde siempre en español y en formato JSON estrictamente válido.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "Nombre apetecible y claro del plato en español",
              },
              prepTime: {
                type: Type.STRING,
                description: "Tiempo estimado de preparación (ej: '20 min')",
              },
              servings: {
                type: Type.STRING,
                description: "Número de porciones (ej: '1-2 porciones')",
              },
              difficulty: {
                type: Type.STRING,
                description: "'Fácil' o 'Medio'",
              },
              summary: {
                type: Type.STRING,
                description: "Breve resumen apetecible destacando su balance de proteínas y verduras frescas",
              },
              ingredientsUsed: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Lista de ingredientes del refrigerador con sus cantidades sugeridas",
              },
              pantryItems: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Especias o básicos de despensa mínimos necesarios (aceite, pimienta, etc.)",
              },
              instructions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Pasos claros, directos y secuenciales de preparación",
              },
              nutritionHighlights: {
                type: Type.OBJECT,
                properties: {
                  proteinInfo: {
                    type: Type.STRING,
                    description: "Descripción del aporte proteico (ej: 'Pechuga y huevo aportan ~32g de proteína')",
                  },
                  carbsSugarInfo: {
                    type: Type.STRING,
                    description: "Detalle de bajo contenido en carbohidratos y libre de azúcares",
                  },
                  sodiumInfo: {
                    type: Type.STRING,
                    description: "Cómo se potencia el sabor sin requerir exceso de sal",
                  },
                },
                required: ["proteinInfo", "carbsSugarInfo", "sodiumInfo"],
              },
              chefTip: {
                type: Type.STRING,
                description: "Consejo culinario del chef para conservar frescura y sabor",
              },
            },
            required: [
              "title",
              "prepTime",
              "servings",
              "difficulty",
              "summary",
              "ingredientsUsed",
              "pantryItems",
              "instructions",
              "nutritionHighlights",
              "chefTip",
            ],
          },
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("No se recibió respuesta del modelo.");
      }

      const recipeData = JSON.parse(text);
      const fullRecipe = {
        id: "rec-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
        ...recipeData,
        createdAt: Date.now(),
      };

      return res.json({ recipe: fullRecipe });
    } catch (error: any) {
      console.error("Error generating recipe:", error);
      return res.status(500).json({
        error: error.message || "Ocurrió un error al generar la receta.",
      });
    }
  });

  // Vite development or production static files
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
