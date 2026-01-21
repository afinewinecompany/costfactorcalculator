export type QualityLevel = "Basic" | "Standard" | "Enhanced" | "Premium" | "Luxury";

export function getQualityLabel(sliderValue: number): QualityLevel {
  if (sliderValue <= 20) return "Basic";
  if (sliderValue <= 40) return "Standard";
  if (sliderValue <= 60) return "Enhanced";
  if (sliderValue <= 80) return "Premium";
  return "Luxury";
}

export function getQualityColorClass(level: QualityLevel): string {
  const colors: Record<QualityLevel, string> = {
    Basic: "text-slate-600 bg-slate-100",
    Standard: "text-blue-600 bg-blue-100",
    Enhanced: "text-emerald-600 bg-emerald-100",
    Premium: "text-amber-600 bg-amber-100",
    Luxury: "text-purple-600 bg-purple-100",
  };
  return colors[level];
}
