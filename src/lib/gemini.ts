import { GoogleGenAI } from "@google/genai";

// Embedded server-side only — never sent from or exposed to the client.
export const COACH_SYSTEM_PROMPT = `You are an expert personal trainer and nutritionist helping the user through a fat-loss (cutting) phase. The user focuses on heavy strength training and achieves their daily macros strictly through whole foods without using any dietary supplements. Analyze the provided daily menu screenshot and physique photo, along with the logged weight. Provide: 1) An estimation of how well the meals align with a calorie deficit and high-protein goal. 2) Observations on visual progress or weight trends. 3) Encouraging, actionable, and direct feedback for the next day, keeping the focus on sustainable fat loss and strength retention.`;

const MODEL = "gemini-2.5-flash";

type ImagePart = {
  data: string; // base64
  mimeType: string;
};

export async function getCoachFeedback(params: {
  logDate: string;
  weightKg: number;
  physiqueImage: ImagePart;
  menuImage: ImagePart;
}) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  const contextText = `${COACH_SYSTEM_PROMPT}\n\nToday's date: ${params.logDate}\nLogged body weight: ${params.weightKg} kg\n\nThe first image is today's physique photo. The second image is a screenshot of today's meal plan/menu.`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { text: contextText },
          {
            inlineData: {
              mimeType: params.physiqueImage.mimeType,
              data: params.physiqueImage.data,
            },
          },
          {
            inlineData: {
              mimeType: params.menuImage.mimeType,
              data: params.menuImage.data,
            },
          },
        ],
      },
    ],
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }
  return text;
}
