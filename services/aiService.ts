import { GoogleGenAI, Type } from "@google/genai";
import { SteelGrade, Defect, AppSettings, DEFAULT_SETTINGS } from "../types";

const getSettings = (): AppSettings => {
  const saved = localStorage.getItem('app_settings');
  return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
};

export const analyzeSteelFrame = async (base64Image: string): Promise<{ grade: string; defects: Defect[]; confidence: number }> => {
  const settings = getSettings();
  
  if (settings.aiEngine === 'local') {
    return analyzeWithLocalAI(base64Image, settings);
  }

  return analyzeWithGemini(base64Image);
};

const analyzeWithGemini = async (base64Image: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
          { text: "Analyze this galvanized steel sheet for defects. Return JSON with 'grade' (Grade 1/2/3), 'defects' array (type, severity, description), and 'confidence'." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            grade: { type: Type.STRING },
            defects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  severity: { type: Type.STRING },
                  description: { type: Type.STRING }
                }
              }
            },
            confidence: { type: Type.NUMBER }
          }
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      grade: result.grade?.includes('3') ? SteelGrade.Grade3 : result.grade?.includes('2') ? SteelGrade.Grade2 : SteelGrade.Grade1,
      defects: result.defects || [],
      confidence: result.confidence || 90
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

const analyzeWithLocalAI = async (base64Image: string, settings: AppSettings) => {
  try {
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
    
    // Example for Ollama API (Llava model)
    const response = await fetch(settings.localEndpoint, {
      method: 'POST',
      body: JSON.stringify({
        model: settings.localModelName,
        prompt: "Analyze this galvanized steel for defects. Return strictly valid JSON: { \"grade\": \"Grade 1\", \"defects\": [], \"confidence\": 95 }",
        images: [cleanBase64],
        stream: false,
        format: "json"
      })
    });

    if (!response.ok) throw new Error("Local AI server not responding");
    
    const data = await response.json();
    const result = typeof data.response === 'string' ? JSON.parse(data.response) : data.response;

    return {
      grade: result.grade?.includes('3') ? SteelGrade.Grade3 : result.grade?.includes('2') ? SteelGrade.Grade2 : SteelGrade.Grade1,
      defects: result.defects || [],
      confidence: result.confidence || 85
    };
  } catch (error) {
    console.error("Local AI Error:", error);
    return {
      grade: SteelGrade.Grade2,
      defects: [{ type: "خطای سرور محلی", severity: "High", description: "لطفاً از اجرای Ollama مطمئن شوید." }],
      confidence: 0
    };
  }
};