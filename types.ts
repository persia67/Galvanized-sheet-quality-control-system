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
  grade: string; // Changed from SteelGrade enum to string to support custom grades
  defects: Defect[];
  confidence: number;
  batchId: string;
}

export interface DefectTypeConfig {
  id: string;
  name: string;
  description: string;
}

export interface GradeConfig {
  id: string;
  name: string;
  description: string;
}

export interface AppSettings {
  useWebGPU: boolean;
  modelId: string;
  customDefects: DefectTypeConfig[];
  customGrades: GradeConfig[];
}

export const DEFAULT_SETTINGS: AppSettings = {
  useWebGPU: true,
  modelId: 'Llama-3-8B-Instruct-q4f32_1-MLC',
  customDefects: [
    { id: '1', name: 'شوره سفید (White Rust)', description: 'لکه‌های سفید ناشی از اکسید روی' },
    { id: '2', name: 'خط و خش (Scratches)', description: 'خراشیدگی‌های سطحی یا عمیق روی ورق' },
    { id: '3', name: 'عدم چسبندگی (Peeling)', description: 'پوسته شدن لایه گالوانیزه' },
    { id: '4', name: 'جوش/حفره (Pimples)', description: 'برآمدگی‌های کوچک روی سطح' },
    { id: '5', name: 'اسپانگل نامنظم (Irregular Spangle)', description: 'ناهماهنگی در گل‌های ورق' }
  ],
  customGrades: [
    { id: 'g1', name: 'Grade 1', description: 'بدون عیب یا عیوب بسیار ناچیز (ممتاز)' },
    { id: 'g2', name: 'Grade 2', description: 'عیوب ظاهری کم، قابل مصرف (معمولی)' },
    { id: 'g3', name: 'Grade 3', description: 'عیوب جدی و غیرقابل قبول (ضایعات)' }
  ]
};