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

export interface ModelInfo {
  id: string;
  name: string;
  size: string;
  description: string;
  isVision: boolean;
  recommendedVRAM: string;
}

export interface AppSettings {
  aiEngine: 'gemini' | 'local';
  localEndpoint: string;
  localModelName: string;
  pullEndpoint: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  aiEngine: 'gemini',
  localEndpoint: 'http://localhost:11434/api/generate',
  localModelName: 'llava',
  pullEndpoint: 'http://localhost:11434/api/pull',
};

export const RECOMMENDED_MODELS: ModelInfo[] = [
  {
    id: 'llava',
    name: 'LLaVA (v1.5)',
    size: '4.7 GB',
    description: 'دقیق‌ترین مدل برای تشخیص عیوب ظاهری و جزئیات ورق.',
    isVision: true,
    recommendedVRAM: '8GB+'
  },
  {
    id: 'moondream',
    name: 'Moondream 2',
    size: '829 MB',
    description: 'بسیار سبک و سریع. مناسب برای سیستم‌های بدون کارت گرافیک قوی.',
    isVision: true,
    recommendedVRAM: '2GB+'
  },
  {
    id: 'bakllava',
    name: 'BakLLaVA',
    size: '4.7 GB',
    description: 'نسخه بهینه شده LLaVA با سرعت پاسخ‌دهی بالاتر.',
    isVision: true,
    recommendedVRAM: '8GB+'
  }
];