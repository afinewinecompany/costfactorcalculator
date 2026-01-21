export interface ProjectInput {
  projectName: string;
  projectSize: number; // RSF
  floors: number;
  location: string;
  tiAllowancePerSF?: number; // TI Allowance in $/SF - reduces total cost to client
}

export interface SliderConfig {
  id: string;
  label: string;
  category: string;
  weight: number; // 0-1
  lowFactor: number;
  highFactor: number;
  defaultValue: number;
  currentValue: number;
}

export interface CategoryResult {
  category: string;
  factor: number;
  adjustedFactor: number;
  costPerRSF: number;
  totalCost: number;
}

export interface ProjectOutput {
  uniqueProjectFactor: number;
  categories: CategoryResult[];
  subtotal: number;
  contingencyPercent: number;
  contingency: number;
  grandTotal: number;
  baseTotalPerRSF: number;
  grandTotalPerRSF: number;
  // TI Allowance fields
  tiAllowancePerSF: number;
  tiAllowanceTotal: number;
  clientTotal: number; // grandTotal - tiAllowanceTotal
  clientTotalPerRSF: number;
}

export interface BaseValues {
  constructionCosts: number;
  designFees: number;
  ffeAppliances: number;
  signage: number;
  technology: {
    av: number;
    it: number;
    sec: number;
  };
  other: number;
}
