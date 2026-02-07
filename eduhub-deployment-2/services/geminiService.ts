import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const getEduAdvice = async (userQuery: string, context?: string): Promise<string> => {
  try {
    const ai = getClient();
    const systemInstruction = `
      You are the "EduHub AI Assistant".
      Your goal is to assist Grade 12 learners in South Africa with university applications, course choices based on their marks, and NSFAS (Financial Aid).

      Context about the user/platform:
      - This platform unifies applications for Universities, TVETs, and NSFAS.
      - Users are often from under-resourced backgrounds.
      
      Capabilities:
      - If the user provides their academic marks/transcript data in the context, ANALYZE them against typical Admission Point Scores (APS).
      - Suggest specific courses they might qualify for based on provided subjects and marks (e.g. "With 70% in Math, you likely qualify for BSc Engineering...").
      - Explain APS (Admission Point Score) if asked.
      
      Tone: Encouraging, clear, professional, and empathetic. Avoid jargon.
      
      Current User Academic Context: ${context || 'No specific marks provided yet.'}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userQuery,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "I apologize, I couldn't generate a response at this moment.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    if (error.message?.includes('429') || error.message?.toLowerCase().includes('quota')) {
        return "I'm receiving too many requests right now. Please try again in a few moments.";
    }

    return "I'm having trouble connecting to the server. Please check your internet connection or try again later.";
  }
};