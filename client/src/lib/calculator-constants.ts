import { BaseValues, SliderConfig } from "./calculator-types";

export const PROJECT_SIZE_RANGES = [
  { label: "< 15,000 RSF", min: 0, max: 15000, factor: 1.5 },
  { label: "15,001 - 30,000 RSF", min: 15001, max: 30000, factor: 1.1 },
  { label: "30,001 - 60,000 RSF", min: 30001, max: 60000, factor: 1.0 },
  { label: "60,000+ RSF", min: 60001, max: Infinity, factor: 0.98 },
];

export const FLOOR_FACTORS: Record<number, number> = {
  1: 1.0,
  2: 1.2,
  3: 1.3,
  4: 1.35,
  5: 1.37,
  6: 1.4,
  7: 1.45,
};

export const LOCATIONS = [
  { location: "New York, NY", factor: 1.0 },
  { location: "Chicago", factor: 0.9 },
  { location: "Boston", factor: 0.9 },
  { location: "LA", factor: 1.0 },
  { location: "Atlanta", factor: 0.85 },
];

export const BASE_VALUES_PER_RSF: BaseValues = {
  constructionCosts: 260.75,
  designFees: 21.0,
  ffeAppliances: 40.25,
  signage: 5.25,
  technology: {
    av: 11.55,
    it: 3.85,
    sec: 3.85,
  },
  other: 3.5,
};

export const DEFAULT_CONTINGENCY_PERCENT = 0.05;

// Initial Slider Configurations grouped by Category
export const INITIAL_SLIDERS: Record<string, Omit<SliderConfig, "currentValue" | "category">[]> = {
  construction: [
    { id: "programRequirements", label: "Program Requirements", weight: 0.40, lowFactor: 0.70, highFactor: 1.40, defaultValue: 1.05 },
    { id: "acousticalPerformance", label: "Acoustical Performance", weight: 0.20, lowFactor: 0.70, highFactor: 1.25, defaultValue: 0.975 },
    { id: "levelOfFinish", label: "Level of Finish", weight: 0.20, lowFactor: 0.75, highFactor: 1.25, defaultValue: 1.00 },
    { id: "amenities", label: "Amenities", weight: 0.075, lowFactor: 0.75, highFactor: 1.10, defaultValue: 0.925 },
    { id: "criticalSystems", label: "Critical Systems", weight: 0.075, lowFactor: 0.75, highFactor: 1.10, defaultValue: 0.925 },
    { id: "comfort", label: "Comfort", weight: 0.05, lowFactor: 0.75, highFactor: 1.10, defaultValue: 0.925 },
  ],
  ffeAppliances: [
    { id: "ffe", label: "FF&E", weight: 0.95, lowFactor: 0.75, highFactor: 1.20, defaultValue: 0.975 },
    { id: "appliances", label: "Appliances", weight: 0.05, lowFactor: 0.50, highFactor: 2.00, defaultValue: 1.25 },
  ],
  signage: [
    { id: "signage", label: "Signage", weight: 1.00, lowFactor: 0.75, highFactor: 1.20, defaultValue: 0.975 },
  ],
  technology: [
    { id: "av", label: "AV", weight: 0.60, lowFactor: 0.80, highFactor: 1.50, defaultValue: 1.15 },
    { id: "it", label: "IT", weight: 0.25, lowFactor: 0.80, highFactor: 1.30, defaultValue: 1.05 },
    { id: "sec", label: "SEC", weight: 0.15, lowFactor: 0.80, highFactor: 1.20, defaultValue: 1.00 },
  ],
  designFees: [
    // Note: "Based on Above" is special logic handled in the engine, not a standard slider input
    { id: "permittingComplexity", label: "Permitting Complexity", weight: 0.30, lowFactor: 0.80, highFactor: 1.20, defaultValue: 1.00 },
  ],
  other: [
    { id: "movingCosts", label: "Moving Costs", weight: 1.00, lowFactor: 0.80, highFactor: 1.20, defaultValue: 1.00 },
  ],
};
