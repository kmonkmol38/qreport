
export interface Employee {
  employeeId: string;
  employeeName: string;
  mealType: string;
  companyName: string;
  campAllocation: string;
  accessCard: string;
  cardNumber: string;
}

// v4 Normalized Format for massive datasets
export interface NormalizedPackage {
  r: any[][]; // Rows as arrays: [id, name, mealIdx, compIdx, campIdx, accIdx, cardNo]
  m: string[]; // Dictionary: Meal Types
  c: string[]; // Dictionary: Companies
  l: string[]; // Dictionary: Locations/Camps
  a: string[]; // Dictionary: Access Statuses
}

export interface SyncMetadata {
  submitterName: string;
  fileName: string;
  timestamp: string;
}

export interface SyncPackage {
  chunkCount: number; // How many chunks to fetch
  metadata: SyncMetadata | null;
  v: number; // Versioning: 5 is Chunked + Normalized + LZ
}

export enum AppStatus {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}
