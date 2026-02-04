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

export interface ChartDataPoint {
  name: string;
  value: number;
  fill?: string;
}