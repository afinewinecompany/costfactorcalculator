import { 
  ProjectInput, 
  SliderConfig, 
  ProjectOutput, 
  CategoryResult,
  BaseValues 
} from "./calculator-types";
import { 
  PROJECT_SIZE_RANGES, 
  FLOOR_FACTORS, 
  LOCATIONS, 
  BASE_VALUES_PER_RSF, 
  INITIAL_SLIDERS,
  DEFAULT_CONTINGENCY_PERCENT 
} from "./calculator-constants";

// Helper: Interpolate slider value (0-100) to factor
export function sliderToFactor(value: number, low: number, high: number): number {
  return low + (high - low) * (value / 100);
}

// Helper: Get factor from slider ID and value
export function getFactorForSlider(sliderId: string, value: number, config: SliderConfig): number {
  return sliderToFactor(value, config.lowFactor, config.highFactor);
}

// Main Calculation Engine
export function calculateProjectCosts(
  inputs: ProjectInput,
  sliderValues: Record<string, number> // Map of slider ID to value (0-100)
): ProjectOutput {
  
  // 1. Calculate Unique Project Factor
  const projectSizeFactor = PROJECT_SIZE_RANGES.find(
    r => inputs.projectSize >= r.min && inputs.projectSize <= r.max
  )?.factor ?? 1.0;

  const floorsFactor = FLOOR_FACTORS[inputs.floors] ?? 1.45; // Default max if not found
  
  const locationFactor = LOCATIONS.find(l => l.location === inputs.location)?.factor ?? 1.0;

  const uniqueProjectFactor = 
    (projectSizeFactor * 0.33) + 
    (floorsFactor * 0.34) + 
    (locationFactor * 0.33);

  // 2. Calculate Category Factors
  const categories: CategoryResult[] = [];
  
  // Helper to calculate a standard category
  const calculateCategory = (
    catKey: string, 
    baseCostPerRSF: number
  ): { factor: number, adjustedFactor: number, costPerRSF: number, totalCost: number } => {
    const sliders = INITIAL_SLIDERS[catKey];
    if (!sliders) return { factor: 1.0, adjustedFactor: 1.0, costPerRSF: 0, totalCost: 0 };

    let weightedFactorSum = 0;
    
    sliders.forEach(slider => {
      const value = sliderValues[slider.id] ?? slider.defaultValue * 100; // Assuming default is factor, need to convert back? 
      // WAIT: INITIAL_SLIDERS defaultValue is the FACTOR value, not 0-100 position.
      // We need to reverse calculate the 0-100 position for the default state if we haven't initialized it.
      // But here we receive 0-100 values from state.
      // Let's assume the state is initialized correctly.
      
      // Actually, for safety, if value is missing, we should derive it from default factor.
      // But for this function, let's assume valid inputs or handle defaults.
      
      // Let's re-read the constants. 
      // defaultValue: 1.05 (Factor).
      // low: 0.70, high: 1.40.
      // 1.05 is exactly middle (50%).
      
      let factor = 0;
      if (sliderValues[slider.id] !== undefined) {
         factor = sliderToFactor(sliderValues[slider.id], slider.lowFactor, slider.highFactor);
      } else {
         // Fallback to default factor
         factor = slider.defaultValue;
      }
      
      weightedFactorSum += factor * slider.weight;
    });

    const adjustedFactor = weightedFactorSum * uniqueProjectFactor;
    const costPerRSF = baseCostPerRSF * adjustedFactor;
    const totalCost = costPerRSF * inputs.projectSize;

    return { factor: weightedFactorSum, adjustedFactor, costPerRSF, totalCost };
  };

  // --- Construction ---
  const construction = calculateCategory("construction", BASE_VALUES_PER_RSF.constructionCosts);
  categories.push({ category: "Construction Costs", ...construction });

  // --- FF&E / Appliances ---
  const ffe = calculateCategory("ffeAppliances", BASE_VALUES_PER_RSF.ffeAppliances);
  categories.push({ category: "FF&E / Appliances", ...ffe });

  // --- Signage ---
  const signage = calculateCategory("signage", BASE_VALUES_PER_RSF.signage);
  categories.push({ category: "Signage", ...signage });

  // --- Technology ---
  // Tech base value is sum of AV, IT, SEC
  const techBase = BASE_VALUES_PER_RSF.technology.av + BASE_VALUES_PER_RSF.technology.it + BASE_VALUES_PER_RSF.technology.sec;
  const technology = calculateCategory("technology", techBase);
  categories.push({ category: "Technology", ...technology });

  // --- Other (Moving Costs) ---
  const other = calculateCategory("other", BASE_VALUES_PER_RSF.other);
  categories.push({ category: "Other", ...other });

  // --- Design Fees (Special Calculation) ---
  // Factor = (ConstructionFactor * 0.70) + (PermittingSlider * 0.30)
  const constructionFactorRaw = construction.factor;
  
  const permittingSlider = INITIAL_SLIDERS["designFees"]?.[0]; // Permitting Complexity
  let permittingFactor = 1.0;
  if (permittingSlider) {
    const val = sliderValues[permittingSlider.id];
    if (val !== undefined) {
      permittingFactor = sliderToFactor(val, permittingSlider.lowFactor, permittingSlider.highFactor);
    } else {
      permittingFactor = permittingSlider.defaultValue;
    }
  }

  const designFactorRaw = (constructionFactorRaw * 0.70) + (permittingFactor * 0.30);
  const designAdjustedFactor = designFactorRaw * uniqueProjectFactor;
  const designCostPerRSF = BASE_VALUES_PER_RSF.designFees * designAdjustedFactor;
  const designTotalCost = designCostPerRSF * inputs.projectSize;

  categories.push({
    category: "Design Fees",
    factor: designFactorRaw,
    adjustedFactor: designAdjustedFactor,
    costPerRSF: designCostPerRSF,
    totalCost: designTotalCost
  });

  // --- Totals ---
  const subtotal = categories.reduce((sum, cat) => sum + cat.totalCost, 0);
  const contingency = subtotal * DEFAULT_CONTINGENCY_PERCENT;
  const grandTotal = subtotal + contingency;

  // Base Totals (for reference/projection)
  // Sum of all base values
  const totalBasePerRSF = 
    BASE_VALUES_PER_RSF.constructionCosts + 
    BASE_VALUES_PER_RSF.designFees + 
    BASE_VALUES_PER_RSF.ffeAppliances + 
    BASE_VALUES_PER_RSF.signage + 
    techBase + 
    BASE_VALUES_PER_RSF.other;

  return {
    uniqueProjectFactor,
    categories,
    subtotal,
    contingencyPercent: DEFAULT_CONTINGENCY_PERCENT,
    contingency,
    grandTotal,
    baseTotalPerRSF: totalBasePerRSF,
    grandTotalPerRSF: grandTotal / inputs.projectSize
  };
}

// Helper to get initial slider 0-100 values from default factors
export function getInitialSliderValues(): Record<string, number> {
  const values: Record<string, number> = {};
  
  Object.values(INITIAL_SLIDERS).flat().forEach(slider => {
    // Inverse of: low + (high - low) * (val / 100) = factor
    // val / 100 = (factor - low) / (high - low)
    // val = ((factor - low) / (high - low)) * 100
    const percent = ((slider.defaultValue - slider.lowFactor) / (slider.highFactor - slider.lowFactor)) * 100;
    values[slider.id] = Math.max(0, Math.min(100, percent));
  });
  
  return values;
}
