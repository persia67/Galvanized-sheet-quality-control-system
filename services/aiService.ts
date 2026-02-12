import { CreateMLCEngine } from "@mlc-ai/web-llm";
import { Defect, AppSettings, DEFAULT_SETTINGS } from "../types";

let engine: any = null;

const getSettings = (): AppSettings => {
  const saved = localStorage.getItem('app_settings');
  return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
};

// Singleton engine initializer
const getEngine = async (progressCallback?: (info: any) => void) => {
  if (engine) return engine;
  
  const settings = getSettings();
  try {
    engine = await CreateMLCEngine(
      settings.modelId,
      { 
        initProgressCallback: progressCallback 
      }
    );
    return engine;
  } catch (e) {
    console.error("Failed to load WebLLM engine:", e);
    throw e;
  }
};

export const reloadEngine = async (progressCallback?: (info: any) => void) => {
  if(engine) {
     await engine.unload();
     engine = null;
  }
  return await getEngine(progressCallback);
};

export const analyzeSteelFrame = async (base64Image: string): Promise<{ grade: string; defects: Defect[]; confidence: number }> => {
  const settings = getSettings();

  // Dynamically build the prompt parts based on settings
  const defectList = settings.customDefects.map(d => `- ${d.name}: ${d.description}`).join('\n');
  const gradeList = settings.customGrades.map(g => `- ${g.name}: ${g.description}`).join('\n');

  try {
    const ai = await getEngine();
    
    // Construct dynamic system prompt
    const systemPrompt = `You are a strict QA inspector for galvanized steel. 
    Analyze the input for the following SPECIFIC defects:
    ${defectList}

    Classify the result into one of the following grades based on defects found:
    ${gradeList}

    Output ONLY valid JSON: 
    {
      "grade": "Exact Name of one of the defined grades", 
      "defects": [{"type": "Name from the defect list", "severity": "High"|"Medium"|"Low", "description": "Short reasoning"}], 
      "confidence": number (0-100)
    }`;

    const messages = [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: "Analyze this surface image. [Image Data Placeholder]"
      }
    ];

    const reply = await ai.chat.completions.create({
      messages,
      temperature: 0.1, // Low temperature for consistency
      response_format: { type: "json_object" }
    });

    const text = reply.choices[0].message.content;
    const result = JSON.parse(text);

    // Ensure the returned grade matches one of our custom grades, or fallback to the first one
    let grade = result.grade;
    const gradeExists = settings.customGrades.some(g => g.name === grade);
    if (!gradeExists && settings.customGrades.length > 0) {
        // Fallback logic if AI hallucinates a grade name
        if (grade.includes('1') || grade.toLowerCase().includes('good')) grade = settings.customGrades[0].name;
        else if (grade.includes('3') || grade.toLowerCase().includes('scrap')) grade = settings.customGrades[settings.customGrades.length - 1].name;
        else grade = settings.customGrades.length > 1 ? settings.customGrades[1].name : settings.customGrades[0].name;
    }

    return {
      grade: grade,
      defects: result.defects || [],
      confidence: result.confidence || 90
    };

  } catch (error) {
    console.error("WebLLM Error:", error);
    // Strict fallback for error
    return {
      grade: settings.customGrades.length > 1 ? settings.customGrades[1].name : "Grade 2",
      defects: [{ type: "خطای پردازش محلی", severity: "High", description: "عدم توانایی در اجرای مدل روی WebGPU." }],
      confidence: 0
    };
  }
};