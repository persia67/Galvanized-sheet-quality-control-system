
import { GoogleGenAI, Type } from "@google/genai";
import { SteelGrade, Defect } from "../types";

// Using gemini-3-flash-preview which is suitable for vision analysis and supports JSON schema
const MODEL_NAME = 'gemini-3-flash-preview';

export const analyzeSteelFrame = async (base64Image: string): Promise<{ grade: string; defects: Defect[]; confidence: number }> => {
  try {
    const prompt = `
      به عنوان یک مهندس کنترل کیفیت متخصص در خط تولید ورق گالوانیزه عمل کنید.
      این تصویر را برای عیوب رایج ورق گالوانیزه مانند:
      - شوره سفید (White Rust)
      - خط و خش (Scratches)
      - عدم چسبندگی پوشش (Peeling)
      - حفره یا جوش (Pimples/Blisters)
      - ایرادات اسپانگل یا گل ورق (Spangle irregularity)
      - تغییر رنگ یا لکه (Stains)
      
      تحلیل کنید.
      
      بر اساس عیوب، ورق را درجه‌بندی کنید:
      - اگر عیبی ندارد یا بسیار ناچیز است: Grade 1
      - اگر عیوب ظاهری دارد اما قابل مصرف است: Grade 2
      - اگر عیوب جدی دارد: Grade 3
      
      پاسخ را دقیقاً بر اساس طرحواره JSON تعیین شده برگردانید.
    `;

    // Remove header from base64 if present
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

    // Initialize AI right before the call to ensure the latest API key is used
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            grade: {
              type: Type.STRING,
              description: "The quality grade of the steel sheet (Grade 1, Grade 2, or Grade 3)",
            },
            defects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: "Type of defect in Persian" },
                  severity: { type: Type.STRING, description: "Low, Medium, or High" },
                  description: { type: Type.STRING, description: "Short description in Persian" }
                },
                required: ["type", "severity", "description"]
              }
            },
            confidence: {
              type: Type.NUMBER,
              description: "Confidence level between 0 and 100"
            }
          },
          required: ["grade", "defects", "confidence"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const result = JSON.parse(text);
    
    // Map string grade to Enum for consistency if needed, strictly utilizing the response
    let finalGrade = SteelGrade.Grade1;
    if (result.grade && result.grade.includes('2')) finalGrade = SteelGrade.Grade2;
    if (result.grade && result.grade.includes('3')) finalGrade = SteelGrade.Grade3;

    return {
      grade: finalGrade,
      defects: Array.isArray(result.defects) ? result.defects : [],
      confidence: typeof result.confidence === 'number' ? result.confidence : 0
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback mock response in case of API error for demo stability
    return {
      grade: SteelGrade.Grade2,
      defects: [{ type: "خطای سیستم", severity: "Low", description: "عدم ارتباط با هوش مصنوعی" }],
      confidence: 0
    };
  }
};
