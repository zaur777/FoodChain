
export type Language = 'az' | 'ru' | 'en';

export interface Company {
  id: string;
  name: string;
  plan: 'small' | 'middle' | 'big';
  email: string;
  taxId?: string;
  phone?: string;
}

export enum HazardType {
  BIOLOGICAL = 'Biological',
  CHEMICAL = 'Chemical',
  PHYSICAL = 'Physical',
  RADIOLOGICAL = 'Radiological'
}

export enum Severity {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export interface HACCPTeamMember {
  id: string;
  name: string;
  role: string;
  responsibility: string;
}

export interface Material {
  id: string;
  name: string;
  type: 'Ingredient' | 'Additive' | 'Packaging';
  regulatoryDoc: string;
  storageConditions: string;
  expirationPeriod: string;
  allergens: string[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  intendedUse: string;
  targetAudience: string;
}

export interface FlowStep {
  id: string;
  order: number;
  name: string;
  description: string;
}

export interface HazardAnalysis {
  id: string;
  flowStepId: string;
  processStep: string;
  potentialHazard: string;
  type: HazardType;
  severity: Severity;
  probability: Severity;
  justification: string;
  preventativeMeasures: string;
  decisionTree: {
    q1: boolean;
    q2: boolean;
    q3: boolean;
    q4: boolean;
  };
  isCCP: boolean;
  associatedMaterialIds: string[];
}

export interface CriticalControlPoint {
  id: string;
  hazardId: string;
  criticalLimits: string;
  monitoringProcedures: string;
  monitoringFrequency: string;
  monitoringResponsibility: string;
  correctiveActions: string;
  verificationProcedures: string;
  validation: string;
  validationProcedures: string;
  records: string;
  associatedMaterialIds: string[];
}

export interface HACCPPlan {
  id: string;
  name: string;
  status: 'Draft' | 'Active' | 'Archived';
  createdAt: string;
  team: HACCPTeamMember[];
  materials: Material[];
  products: Product[];
  flowSteps: FlowStep[];
  hazards: HazardAnalysis[];
  ccps: CriticalControlPoint[];
}

export interface MonitoringLog {
  id: string;
  ccpId: string;
  timestamp: string;
  value: number;
  unit: string;
  operator: string;
  status: 'Normal' | 'Warning' | 'Critical';
  actionTaken?: string;
}

export type DocType = 
  | 'Hygiene' 
  | 'Refrigeration' 
  | 'Storage' 
  | 'FryingOil' 
  | 'ProductInspection' 
  | 'Sanitization' 
  | 'PestControl' 
  | 'RawMaterial' 
  | 'Equipment';

export interface Attachment {
  id: string;
  name: string;
  type: string;
  data: string; // base64
}

export interface EDocument {
  id: string;
  companyId: string;
  type: DocType;
  title: string;
  description: string;
  timestamp: string; // ISO string for date and time
  providedBy: string; // Person who performed the check
  inputtedBy: string; // Person who entered the data
  attachments: Attachment[];
  metadata: Record<string, any>;
}
