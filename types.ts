export enum SteelGrade {
  Grade1 = 'درجه ۱ (ممتاز)',
  Grade2 = 'درجه ۲ (معمولی)',
  Grade3 = 'درجه ۳ (ضایعات)',
}

export interface Defect {
  type: string;
  severity: 'Low' | 'Medium' | 'High';
  description: string;
}

export interface InspectionRecord {
  id: string;
  timestamp: number;
  imageUrl: string;
  grade: SteelGrade;
  defects: Defect[];
  confidence: number;
  batchId: string;
}

export interface AppSettings {
  useWebGPU: boolean;
  modelId: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  useWebGPU: true,
  // Using a model compatible with MLC WebLLM that supports vision or text analysis
  modelId: 'Llama-3-8B-Instruct-q4f32_1-MLC', 
};