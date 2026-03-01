import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface MoodAnalysis {
  serotonin: number;
  dopamine: number;
  cortisol: number;
  summary: string;
  alternatives: string[];
}

export interface MealPlan {
  days: {
    day: string;
    breakfast: string;
    lunch: string;
    dinner: string;
    snack: string;
    reason: string;
  }[];
  shoppingList: string[];
}

export const analyzeFoodMood = async (food: string): Promise<MoodAnalysis> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the impact of eating "${food}" on mental health. 
    Focus on Serotonin, Dopamine, Cortisol, and Glucose Spike (0-10). 
    Provide a score from -10 to 10 for neurotransmitters/hormones.
    Include a brief summary and 2-3 healthier Indian alternatives if the food is unhealthy.
    Return JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          serotonin: { type: Type.NUMBER },
          dopamine: { type: Type.NUMBER },
          cortisol: { type: Type.NUMBER },
          glucoseSpike: { type: Type.NUMBER },
          summary: { type: Type.STRING },
          alternatives: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["serotonin", "dopamine", "cortisol", "glucoseSpike", "summary", "alternatives"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
};

export const generateCreatorScript = async (topic: string, framework: 'Pareto' | 'Identity' | 'Biology'): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a viral social media script for a health creator about "${topic}" using the "${framework}" framework.
    Include a hook, 3 key points, and a CTA. Use emojis and high-energy language.`,
  });
  return response.text || "Failed to generate script.";
};

export const generateMealPlan = async (mood: string, challenge: string): Promise<MealPlan> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a 7-day mood-boosting Indian meal plan for someone feeling "${mood}" with the challenge "${challenge}".
    Include Breakfast, Lunch, Dinner, and a Snack for each day.
    Use only Indian foods.
    Provide a reason for the choices based on nutritional psychiatry.
    Include a consolidated shopping list.
    Return JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          days: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.STRING },
                breakfast: { type: Type.STRING },
                lunch: { type: Type.STRING },
                dinner: { type: Type.STRING },
                snack: { type: Type.STRING },
                reason: { type: Type.STRING },
              },
              required: ["day", "breakfast", "lunch", "dinner", "snack", "reason"],
            },
          },
          shoppingList: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["days", "shoppingList"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
};

export const getDailyAffirmation = async (mood: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a short, powerful, and calming mental health affirmation for someone feeling "${mood}". 
    Keep it under 15 words.`,
  });
  return response.text || "You are capable of handling whatever this day brings.";
};
