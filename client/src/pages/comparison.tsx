import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ArrowLeft,
  Printer,
  Building2,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Scale,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Layers,
  BarChart3,
  Loader2,
  Award,
  Star,
  Crown,
  Zap,
  Target,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  Info,
  Share2,
  Lightbulb,
  PiggyBank,
  CircleDollarSign,
  BadgeCheck,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { SavedEstimate } from "@shared/schema";

// Brand-aligned color palette for estimates
const ESTIMATE_COLORS = [
  { bg: "#2F739E", light: "#E8F4FA", text: "#1a4a66" },
  { bg: "#6BB6D6", light: "#EEF8FC", text: "#2d6a85" },
  { bg: "#4A90B8", light: "#E6F2F9", text: "#2a5a75" },
  { bg: "#8FCCE8", light: "#F0FAFD", text: "#3a7a95" },
];

// Category colors for charts
const CATEGORY_COLORS = ["#2F739E", "#4A90B8", "#6BB6D6", "#8FCCE8", "#B3DDF2", "#D6EEFA"];

// Estimate classification types
type EstimateClassification = "best-value" | "premium" | "budget-friendly" | "balanced";

interface EstimateWithColors extends SavedEstimate {
  color: typeof ESTIMATE_COLORS[number];
  colorIndex: number;
  classification?: EstimateClassification;
}

interface ActionableInsight {
  type: "savings" | "warning" | "info" | "recommendation";
  title: string;
  text: string;
  explanation?: string;
  impact?: "high" | "medium" | "low";
  category?: string;
  savingsAmount?: number;
  percentDiff?: number;
}

interface EstimateProscons {
  estimateId: string;
  estimateName: string;
  pros: string[];
  cons: string[];
  premiumFeatures?: string[];
}

interface CategoryImpact {
  category: string;
  minValue: number;
  maxValue: number;
  difference: number;
  percentDiff: number;
  lowestEstimateName: string;
  highestEstimateName: string;
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function formatCompactCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}k`;
  }
  return `$${value.toFixed(0)}`;
}

function getPercentDiff(base: number, compare: number): number {
  if (base === 0) return 0;
  return ((compare - base) / base) * 100;
}

// Classify an estimate based on its position relative to others
function classifyEstimate(
  estimate: SavedEstimate,
  allEstimates: SavedEstimate[],
  lowestTotal: number,
  highestTotal: number
): EstimateClassification {
  const total = Number(estimate.grandTotal);
  const range = highestTotal - lowestTotal;

  if (range === 0) return "balanced";

  const position = (total - lowestTotal) / range;

  if (position <= 0.1) return "budget-friendly";
  if (position >= 0.85) return "premium";
  if (position <= 0.4) return "best-value";
  return "balanced";
}

// Get badge styling based on classification
function getClassificationBadge(classification: EstimateClassification) {
  switch (classification) {
    case "best-value":
      return {
        label: "Best Value",
        icon: Award,
        bgClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
        iconClass: "text-emerald-600",
      };
    case "premium":
      return {
        label: "Premium",
        icon: Crown,
        bgClass: "bg-amber-100 text-amber-700 border-amber-200",
        iconClass: "text-amber-600",
      };
    case "budget-friendly":
      return {
        label: "Budget Friendly",
        icon: PiggyBank,
        bgClass: "bg-blue-100 text-blue-700 border-blue-200",
        iconClass: "text-blue-600",
      };
    case "balanced":
      return {
        label: "Balanced",
        icon: Scale,
        bgClass: "bg-slate-100 text-slate-700 border-slate-200",
        iconClass: "text-slate-600",
      };
  }
}

export default function ComparisonPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const projectId = params.get("project");
  const preselectedIds = params.get("estimates")?.split(",").filter(Boolean) || [];

  const [selectedEstimateIds, setSelectedEstimateIds] = useState<string[]>(preselectedIds);
  const [showEstimateSelector, setShowEstimateSelector] = useState(true);
  const [expandedInsights, setExpandedInsights] = useState(true);
  const [expandedDecisionHelper, setExpandedDecisionHelper] = useState(true);

  // Fetch project with all its estimates
  const { data: projectData, isLoading: projectLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) throw new Error("Failed to fetch project");
      return res.json();
    },
    enabled: !!projectId,
  });

  // Fetch selected estimates for comparison
  const { data: selectedEstimates, isLoading: estimatesLoading } = useQuery({
    queryKey: ["estimates", selectedEstimateIds],
    queryFn: async () => {
      if (selectedEstimateIds.length === 0) return [];
      const res = await fetch(`/api/estimates?ids=${selectedEstimateIds.join(",")}`);
      if (!res.ok) throw new Error("Failed to fetch estimates");
      return res.json();
    },
    enabled: selectedEstimateIds.length > 0,
  });

  // Add colors and classifications to selected estimates
  const coloredEstimates: EstimateWithColors[] = useMemo(() => {
    if (!selectedEstimates || selectedEstimates.length < 2) return selectedEstimates?.map((est: SavedEstimate, i: number) => ({
      ...est,
      color: ESTIMATE_COLORS[i % ESTIMATE_COLORS.length],
      colorIndex: i,
    })) || [];

    const totals = selectedEstimates.map((e: SavedEstimate) => Number(e.grandTotal));
    const minTotal = Math.min(...totals);
    const maxTotal = Math.max(...totals);

    return selectedEstimates.map((est: SavedEstimate, i: number) => ({
      ...est,
      color: ESTIMATE_COLORS[i % ESTIMATE_COLORS.length],
      colorIndex: i,
      classification: classifyEstimate(est, selectedEstimates, minTotal, maxTotal),
    }));
  }, [selectedEstimates]);

  // Auto-collapse selector when estimates are selected
  useEffect(() => {
    if (selectedEstimateIds.length >= 2) {
      setShowEstimateSelector(false);
    }
  }, [selectedEstimateIds.length]);

  // Calculate comprehensive comparison data
  const comparisonData = useMemo(() => {
    if (coloredEstimates.length < 2) return null;

    const estimates = coloredEstimates;
    const baseEstimate = estimates[0];

    // Find min/max totals
    const totals = estimates.map((e) => Number(e.grandTotal));
    const clientTotals = estimates.map((e) => Number(e.clientTotal));
    const minTotal = Math.min(...totals);
    const maxTotal = Math.max(...totals);
    const lowestIndex = totals.indexOf(minTotal);
    const highestIndex = totals.indexOf(maxTotal);
    const totalSavings = maxTotal - minTotal;
    const savingsPercent = getPercentDiff(maxTotal, minTotal);

    // Find best value (considering quality indicators)
    // For now, best value is the lowest cost option, but could be enhanced with quality metrics
    const bestValueIndex = lowestIndex;
    const bestValueEstimate = estimates[bestValueIndex];

    // Calculate category comparison data for charts
    const categories = baseEstimate.computedOutput?.categories || [];
    const categoryChartData = categories.map((cat: any) => {
      const dataPoint: any = { category: cat.category };
      estimates.forEach((est, i) => {
        const estCat = est.computedOutput?.categories?.find(
          (c: any) => c.category === cat.category
        );
        dataPoint[`estimate${i}`] = estCat?.totalCost || 0;
        dataPoint[`name${i}`] = est.name;
      });
      return dataPoint;
    });

    // Calculate category impact analysis
    const categoryImpacts: CategoryImpact[] = categories.map((cat: any) => {
      const catValues = estimates.map((est) => {
        const estCat = est.computedOutput?.categories?.find(
          (c: any) => c.category === cat.category
        );
        return { est, value: estCat?.totalCost || 0 };
      });

      const minValue = Math.min(...catValues.map((c) => c.value));
      const maxValue = Math.max(...catValues.map((c) => c.value));
      const lowestEst = catValues.find((c) => c.value === minValue)?.est;
      const highestEst = catValues.find((c) => c.value === maxValue)?.est;

      return {
        category: cat.category,
        minValue,
        maxValue,
        difference: maxValue - minValue,
        percentDiff: minValue > 0 ? getPercentDiff(minValue, maxValue) : 0,
        lowestEstimateName: lowestEst?.name || "",
        highestEstimateName: highestEst?.name || "",
      };
    }).sort((a, b) => b.difference - a.difference);

    // Generate actionable insights (informational only, no recommendations)
    const insights: ActionableInsight[] = [];

    // Cost range insight (informational, not a recommendation)
    if (totalSavings > 0) {
      insights.push({
        type: "info",
        title: `Budget range spans ${formatCurrency(totalSavings)}`,
        text: `Options range from ${formatCurrency(minTotal)} to ${formatCurrency(maxTotal)}, a ${Math.abs(savingsPercent).toFixed(1)}% difference.`,
        explanation: "This represents the spread between your lowest and highest cost options.",
        impact: "high",
        savingsAmount: totalSavings,
        percentDiff: Math.abs(savingsPercent),
      });
    }

    // Top category impact insights
    categoryImpacts.slice(0, 3).forEach((impact) => {
      if (impact.percentDiff > 15 && impact.difference > 10000) {
        insights.push({
          type: "info",
          title: `${impact.category} drives ${formatCurrency(impact.difference)} in cost difference`,
          text: `${impact.highestEstimateName} allocates ${impact.percentDiff.toFixed(0)}% more than ${impact.lowestEstimateName} in this category.`,
          explanation: `Review ${impact.category.toLowerCase()} specifications if you want to reduce costs while maintaining quality in other areas.`,
          impact: impact.difference > 50000 ? "high" : impact.difference > 20000 ? "medium" : "low",
          category: impact.category,
          percentDiff: impact.percentDiff,
        });
      }
    });

    // Value-per-SF insight
    const perSFValues = estimates.map((e) => Number(e.grandTotalPerRSF));
    const minPerSF = Math.min(...perSFValues);
    const maxPerSF = Math.max(...perSFValues);
    if (maxPerSF - minPerSF > 5) {
      insights.push({
        type: "savings",
        title: `Save $${(maxPerSF - minPerSF).toFixed(0)} per square foot`,
        text: `Cost per SF ranges from $${minPerSF.toFixed(0)} to $${maxPerSF.toFixed(0)} across your options.`,
        explanation: "Lower per-SF cost typically indicates more efficient budget allocation for your space requirements.",
        impact: "medium",
      });
    }

    // Similar budgets insight
    const totalRange = getPercentDiff(minTotal, maxTotal);
    if (totalRange < 5 && estimates.length > 1) {
      insights.push({
        type: "info",
        title: "Estimates are closely priced",
        text: `All options are within ${totalRange.toFixed(1)}% of each other (${formatCurrency(totalSavings)} range).`,
        explanation: "With similar totals, your decision can focus on how the budget is allocated across categories rather than overall cost.",
        impact: "low",
      });
    }

    // Generate pros/cons for decision helper
    const proscons: EstimateProscons[] = estimates.map((est, idx) => {
      const pros: string[] = [];
      const cons: string[] = [];
      const premiumFeatures: string[] = [];

      const estTotal = Number(est.grandTotal);
      const estPerSF = Number(est.grandTotalPerRSF);
      const isLowest = idx === lowestIndex;
      const isHighest = idx === highestIndex;

      // Cost-related pros/cons
      if (isLowest) {
        pros.push(`Lowest total cost (${formatCurrency(estTotal)})`);
        pros.push(`Best value at $${estPerSF.toFixed(0)}/SF`);
      } else if (isHighest) {
        cons.push(`Highest total cost (+${formatCurrency(estTotal - minTotal)} vs lowest)`);
      } else {
        const diffFromLowest = estTotal - minTotal;
        const percentFromLowest = getPercentDiff(minTotal, estTotal);
        if (percentFromLowest < 10) {
          pros.push(`Competitive pricing (+${percentFromLowest.toFixed(1)}% vs lowest)`);
        } else {
          cons.push(`${formatCurrency(diffFromLowest)} above the lowest option`);
        }
      }

      // Category-specific analysis
      categories.forEach((cat: any) => {
        const estCat = est.computedOutput?.categories?.find((c: any) => c.category === cat.category);
        const catValue = estCat?.totalCost || 0;
        const catImpact = categoryImpacts.find((ci) => ci.category === cat.category);

        if (catImpact && catValue === catImpact.minValue && catImpact.percentDiff > 20) {
          pros.push(`Efficient ${cat.category.toLowerCase()} budget`);
        }

        if (catImpact && catValue === catImpact.maxValue && catImpact.percentDiff > 20) {
          if (isHighest || est.classification === "premium") {
            premiumFeatures.push(`Enhanced ${cat.category.toLowerCase()} allocation`);
          } else {
            cons.push(`Higher ${cat.category.toLowerCase()} costs`);
          }
        }
      });

      // Classification-based insights
      if (est.classification === "premium") {
        pros.push("Comprehensive specifications");
        premiumFeatures.push("Premium-tier selections across categories");
      } else if (est.classification === "budget-friendly") {
        pros.push("Cost-conscious approach");
        cons.push("May require trade-offs in some areas");
      } else if (est.classification === "best-value") {
        pros.push("Optimal balance of cost and quality");
      }

      return {
        estimateId: est.id,
        estimateName: est.name,
        pros: pros.slice(0, 4),
        cons: cons.slice(0, 3),
        premiumFeatures: premiumFeatures.slice(0, 3),
      };
    });

    // Mini pie chart data for each estimate
    const estimatePieData = estimates.map((est) => {
      return (est.computedOutput?.categories || []).map((cat: any, i: number) => ({
        name: cat.category,
        value: cat.totalCost,
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      }));
    });

    return {
      estimates,
      lowestIndex,
      highestIndex,
      bestValueIndex,
      bestValueEstimate,
      minTotal,
      maxTotal,
      totalSavings,
      savingsPercent,
      categoryChartData,
      categoryImpacts,
      insights: insights.slice(0, 6),
      proscons,
      estimatePieData,
    };
  }, [coloredEstimates]);

  const handleToggleEstimate = (id: string) => {
    setSelectedEstimateIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((eid) => eid !== id);
      }
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // Loading state
  if (projectLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#2F739E] mx-auto" />
          <p className="text-slate-500">Loading project...</p>
        </div>
      </div>
    );
  }

  // No project state
  if (!projectId || !projectData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <motion.div
          className="text-center space-y-6 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center">
            <Scale className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No Project Selected</h2>
            <p className="text-slate-500">Select a project to compare its budget estimates.</p>
          </div>
          <Button onClick={() => setLocation("/")} className="bg-[#2F739E] hover:bg-[#1d5a7d]">
            Go to Projects
          </Button>
        </motion.div>
      </div>
    );
  }

  const availableEstimates = projectData.estimates || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 selection:bg-[#2F739E]/20 relative overflow-hidden print:bg-white">
      {/* Background elements */}
      <div
        className="absolute inset-0 pointer-events-none print:hidden"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(47, 115, 158, 0.05) 0%, transparent 50%)",
        }}
      />

      {/* Navigation */}
      <nav className="print:hidden sticky top-0 z-20 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 px-4 md:px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <motion.img
            src="/Connected_Logo.png"
            alt="Connected Logo"
            className="h-8 w-auto"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="text-slate-500 hover:text-[#2F739E] hover:bg-[#2F739E]/5"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="hover:bg-slate-50 hover:text-slate-900 border-slate-200"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print Report
          </Button>
        </div>
      </nav>

      {/* Print Header - Only visible when printing */}
      <div className="hidden print:block p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <img src="/Connected_Logo.png" alt="Connected" className="h-10" />
          <div className="text-right">
            <p className="text-sm text-slate-500">Budget Comparison Report</p>
            <p className="text-xs text-slate-400">
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Header */}
        <motion.div
          className="text-center space-y-4 print:text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2F739E]/10 text-sm font-medium text-[#2F739E] print:bg-transparent print:px-0">
            <Scale className="w-4 h-4" />
            Budget Comparison
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
            {projectData.name}
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto print:mx-0">
            Compare your saved estimates side-by-side to find the best option for your project
          </p>
        </motion.div>

        {/* Estimate Selector */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm overflow-hidden print:hidden">
            <button
              onClick={() => setShowEstimateSelector(!showEstimateSelector)}
              className="w-full text-left"
            >
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#2F739E]/10 flex items-center justify-center">
                      <Layers className="w-5 h-5 text-[#2F739E]" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Select Estimates to Compare</CardTitle>
                      <CardDescription>
                        {selectedEstimateIds.length} of {availableEstimates.length} selected (max 4)
                      </CardDescription>
                    </div>
                  </div>
                  {showEstimateSelector ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </CardHeader>
            </button>

            <AnimatePresence>
              {showEstimateSelector && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <CardContent className="pt-4">
                    {availableEstimates.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <p>No saved estimates yet.</p>
                        <p className="text-sm mt-1">
                          Save estimates from the client view to compare them here.
                        </p>
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-3">
                        {availableEstimates.map((estimate: SavedEstimate, index: number) => {
                          const isSelected = selectedEstimateIds.includes(estimate.id);
                          const colorIndex = selectedEstimateIds.indexOf(estimate.id);
                          const color =
                            colorIndex >= 0
                              ? ESTIMATE_COLORS[colorIndex % ESTIMATE_COLORS.length]
                              : null;

                          return (
                            <motion.div
                              key={estimate.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <label
                                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                  isSelected
                                    ? "border-[#2F739E] bg-[#2F739E]/5"
                                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                }`}
                              >
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => handleToggleEstimate(estimate.id)}
                                  disabled={!isSelected && selectedEstimateIds.length >= 4}
                                  className="mt-1"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    {color && (
                                      <div
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: color.bg }}
                                      />
                                    )}
                                    <span className="font-medium text-slate-900 truncate">
                                      {estimate.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                                    <span className="font-mono">
                                      {formatCurrency(Number(estimate.grandTotal))}
                                    </span>
                                    <span className="text-slate-300">|</span>
                                    <span>${Number(estimate.grandTotalPerRSF).toFixed(0)}/SF</span>
                                  </div>
                                  <p className="text-xs text-slate-400 mt-1">
                                    {new Date(estimate.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </label>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* Comparison Content */}
        {selectedEstimateIds.length < 2 ? (
          <motion.div
            className="text-center py-16 space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Select at least 2 estimates</h3>
              <p className="text-slate-500 mt-1">
                Choose estimates from the list above to start comparing
              </p>
            </div>
          </motion.div>
        ) : estimatesLoading ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#2F739E] mx-auto" />
            <p className="text-slate-500 mt-4">Loading comparison...</p>
          </div>
        ) : comparisonData ? (
          <>

            {/* Summary Cards with Classifications */}
            <motion.div
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {comparisonData.estimates.map((estimate, index) => {
                const isLowest = index === comparisonData.lowestIndex;
                const isHighest = index === comparisonData.highestIndex;
                const grandTotal = Number(estimate.grandTotal);
                const clientTotal = Number(estimate.clientTotal);
                const perSF = Number(estimate.grandTotalPerRSF);
                const classification = estimate.classification || "balanced";
                const badge = getClassificationBadge(classification);
                const BadgeIcon = badge.icon;

                return (
                  <motion.div
                    key={estimate.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="print:break-inside-avoid"
                  >
                    <Card
                      className="relative overflow-hidden h-full"
                      style={{
                        borderColor: estimate.color.bg,
                        borderWidth: "2px",
                      }}
                    >
                      {/* Color indicator bar */}
                      <div
                        className="absolute top-0 left-0 right-0 h-1"
                        style={{ backgroundColor: estimate.color.bg }}
                      />

                      <CardContent className="pt-5 pb-4 space-y-3">
                        {/* Classification Badge */}
                        <div className="flex items-center justify-between gap-2">
                          <Badge className={`${badge.bgClass} border flex items-center gap-1 text-xs px-2 py-0.5`}>
                            <BadgeIcon className={`w-3 h-3 ${badge.iconClass}`} />
                            {badge.label}
                          </Badge>
                          {isLowest && comparisonData.estimates.length > 1 && (
                            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                              <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                            </div>
                          )}
                        </div>

                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-slate-900 line-clamp-2 leading-tight text-sm">
                            {estimate.name}
                          </h4>
                        </div>

                        <div>
                          <p className="text-2xl font-bold text-slate-900">
                            {formatCurrency(grandTotal)}
                          </p>
                          <p className="text-sm text-slate-500">${perSF.toFixed(0)} per SF</p>
                        </div>

                        {/* Mini Distribution Chart */}
                        <div className="h-16 print:hidden">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={comparisonData.estimatePieData[index]}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={15}
                                outerRadius={28}
                                paddingAngle={2}
                              >
                                {comparisonData.estimatePieData[index].map((entry: any, i: number) => (
                                  <Cell key={`cell-${i}`} fill={entry.color} />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>

                        {clientTotal !== grandTotal && (
                          <div className="pt-2 border-t border-slate-100">
                            <p className="text-xs text-slate-500 uppercase tracking-wider">
                              After TI Allowance
                            </p>
                            <p className="text-lg font-semibold text-emerald-600">
                              {formatCurrency(clientTotal)}
                            </p>
                          </div>
                        )}

                        {/* Difference from lowest */}
                        {!isLowest && comparisonData.estimates.length > 1 && (
                          <div className="pt-2 border-t border-slate-100">
                            <p className="text-xs text-slate-500">vs best value option</p>
                            <p className="text-sm font-medium text-amber-600">
                              +{formatCurrency(grandTotal - comparisonData.minTotal)} (
                              {getPercentDiff(comparisonData.minTotal, grandTotal).toFixed(1)}%)
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Actionable Insights */}
            {comparisonData.insights.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="print:break-inside-avoid"
              >
                <Card className="bg-gradient-to-br from-[#2F739E]/5 to-[#4A90B8]/5 border-[#2F739E]/20">
                  <button
                    onClick={() => setExpandedInsights(!expandedInsights)}
                    className="w-full text-left print:hidden"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#2F739E]/10 flex items-center justify-center">
                            <Lightbulb className="w-5 h-5 text-[#2F739E]" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Actionable Insights</CardTitle>
                            <CardDescription>What this means for your project</CardDescription>
                          </div>
                        </div>
                        {expandedInsights ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </CardHeader>
                  </button>

                  {/* Print-only header */}
                  <div className="hidden print:block">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <Lightbulb className="w-5 h-5 text-[#2F739E]" />
                        <CardTitle className="text-lg">Actionable Insights</CardTitle>
                      </div>
                    </CardHeader>
                  </div>

                  <AnimatePresence>
                    {(expandedInsights || true) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="print:!h-auto print:!opacity-100"
                      >
                        <CardContent className="pt-0 space-y-4">
                          {comparisonData.insights.map((insight, i) => (
                            <motion.div
                              key={i}
                              className={`p-4 rounded-xl border ${
                                insight.type === "recommendation"
                                  ? "bg-emerald-50/80 border-emerald-200"
                                  : insight.type === "savings"
                                  ? "bg-green-50/80 border-green-200"
                                  : insight.type === "warning"
                                  ? "bg-amber-50/80 border-amber-200"
                                  : "bg-white/60 border-slate-200"
                              }`}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  insight.type === "recommendation"
                                    ? "bg-emerald-100"
                                    : insight.type === "savings"
                                    ? "bg-green-100"
                                    : insight.type === "warning"
                                    ? "bg-amber-100"
                                    : "bg-[#2F739E]/10"
                                }`}>
                                  {insight.type === "recommendation" && (
                                    <Target className="w-4 h-4 text-emerald-600" />
                                  )}
                                  {insight.type === "savings" && (
                                    <CircleDollarSign className="w-4 h-4 text-green-600" />
                                  )}
                                  {insight.type === "warning" && (
                                    <AlertCircle className="w-4 h-4 text-amber-600" />
                                  )}
                                  {insight.type === "info" && (
                                    <TrendingUp className="w-4 h-4 text-[#2F739E]" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className={`font-semibold text-sm ${
                                      insight.type === "recommendation"
                                        ? "text-emerald-800"
                                        : insight.type === "savings"
                                        ? "text-green-800"
                                        : insight.type === "warning"
                                        ? "text-amber-800"
                                        : "text-slate-800"
                                    }`}>
                                      {insight.title}
                                    </h4>
                                    {insight.impact && (
                                      <Badge className={`text-[10px] px-1.5 py-0 ${
                                        insight.impact === "high"
                                          ? "bg-rose-100 text-rose-700 border-rose-200"
                                          : insight.impact === "medium"
                                          ? "bg-amber-100 text-amber-700 border-amber-200"
                                          : "bg-slate-100 text-slate-600 border-slate-200"
                                      } border`}>
                                        {insight.impact} impact
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-slate-600 mt-1">{insight.text}</p>
                                  {insight.explanation && (
                                    <div className="mt-2 pt-2 border-t border-slate-200/50">
                                      <p className="text-xs text-slate-500 flex items-start gap-1.5">
                                        <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                        <span><strong>What this means:</strong> {insight.explanation}</span>
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            )}

            {/* Category Impact Analysis */}
            {comparisonData.categoryImpacts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="print:break-inside-avoid"
              >
                <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Biggest Cost Drivers</CardTitle>
                        <CardDescription>Categories with the largest price differences</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {comparisonData.categoryImpacts.slice(0, 4).map((impact, i) => {
                        const maxWidth = comparisonData.categoryImpacts[0].difference;
                        const barWidth = (impact.difference / maxWidth) * 100;

                        return (
                          <div key={impact.category} className="space-y-1.5">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-slate-700">{impact.category}</span>
                              <span className="text-slate-500">
                                {formatCurrency(impact.difference)} difference
                                {impact.percentDiff > 0 && (
                                  <span className="text-amber-600 ml-1">
                                    ({impact.percentDiff.toFixed(0)}%)
                                  </span>
                                )}
                              </span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${barWidth}%` }}
                                transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                              />
                            </div>
                            <p className="text-xs text-slate-400">
                              {impact.lowestEstimateName}: {formatCurrency(impact.minValue)} | {impact.highestEstimateName}: {formatCurrency(impact.maxValue)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Decision Helper Section */}
            <motion.div
              id="decision-helper"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="print:break-before-page"
            >
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedDecisionHelper(!expandedDecisionHelper)}
                  className="w-full text-left print:hidden"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                          <Scale className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Decision Helper</CardTitle>
                          <CardDescription>Pros, cons, and trade-offs for each option</CardDescription>
                        </div>
                      </div>
                      {expandedDecisionHelper ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </CardHeader>
                </button>

                {/* Print-only header */}
                <div className="hidden print:block">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Scale className="w-5 h-5 text-purple-600" />
                      <CardTitle className="text-lg">Decision Helper</CardTitle>
                    </div>
                  </CardHeader>
                </div>

                <AnimatePresence>
                  {(expandedDecisionHelper || true) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="print:!h-auto print:!opacity-100"
                    >
                      <CardContent className="pt-0">
                        <div className="grid md:grid-cols-2 gap-4">
                          {comparisonData.proscons.map((pc, idx) => {
                            const estimate = comparisonData.estimates[idx];
                            const classification = estimate.classification || "balanced";
                            const badge = getClassificationBadge(classification);
                            const BadgeIcon = badge.icon;

                            return (
                              <motion.div
                                key={pc.estimateId}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * idx }}
                                className="border rounded-xl overflow-hidden print:break-inside-avoid"
                                style={{ borderColor: estimate.color.bg }}
                              >
                                {/* Header */}
                                <div
                                  className="px-4 py-3 flex items-center justify-between"
                                  style={{ backgroundColor: estimate.color.light }}
                                >
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: estimate.color.bg }}
                                    />
                                    <h4 className="font-semibold text-slate-900 text-sm">
                                      {pc.estimateName}
                                    </h4>
                                  </div>
                                  <Badge className={`${badge.bgClass} border flex items-center gap-1 text-[10px] px-1.5 py-0`}>
                                    <BadgeIcon className={`w-2.5 h-2.5 ${badge.iconClass}`} />
                                    {badge.label}
                                  </Badge>
                                </div>

                                {/* Content */}
                                <div className="p-4 space-y-4">
                                  {/* Pros */}
                                  {pc.pros.length > 0 && (
                                    <div>
                                      <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-semibold uppercase tracking-wide mb-2">
                                        <ThumbsUp className="w-3.5 h-3.5" />
                                        Advantages
                                      </div>
                                      <ul className="space-y-1.5">
                                        {pc.pros.map((pro, i) => (
                                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                            {pro}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Premium Features */}
                                  {pc.premiumFeatures && pc.premiumFeatures.length > 0 && (
                                    <div>
                                      <div className="flex items-center gap-1.5 text-amber-700 text-xs font-semibold uppercase tracking-wide mb-2">
                                        <Star className="w-3.5 h-3.5" />
                                        Premium Inclusions
                                      </div>
                                      <ul className="space-y-1.5">
                                        {pc.premiumFeatures.map((feature, i) => (
                                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                            <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                            {feature}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Cons */}
                                  {pc.cons.length > 0 && (
                                    <div>
                                      <div className="flex items-center gap-1.5 text-rose-700 text-xs font-semibold uppercase tracking-wide mb-2">
                                        <ThumbsDown className="w-3.5 h-3.5" />
                                        Considerations
                                      </div>
                                      <ul className="space-y-1.5">
                                        {pc.cons.map((con, i) => (
                                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                            <Minus className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                                            {con}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>

            {/* Category Comparison Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="print:break-inside-avoid"
            >
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#2F739E]" />
                    Category Breakdown Comparison
                  </CardTitle>
                  <CardDescription>
                    See how each estimate allocates budget across categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] print:h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={comparisonData.categoryChartData}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          type="number"
                          tickFormatter={(v) => formatCompactCurrency(v)}
                          stroke="#94a3b8"
                          fontSize={12}
                        />
                        <YAxis
                          type="category"
                          dataKey="category"
                          stroke="#94a3b8"
                          fontSize={12}
                          width={95}
                        />
                        <RechartsTooltip
                          formatter={(value: number, name: string) => [
                            formatCurrency(value),
                            comparisonData.estimates[parseInt(name.replace("estimate", ""))]?.name ||
                              name,
                          ]}
                          contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid rgba(47, 115, 158, 0.2)",
                            boxShadow: "0 10px 40px -10px rgba(47, 115, 158, 0.3)",
                          }}
                        />
                        <Legend
                          formatter={(value: string) => {
                            const idx = parseInt(value.replace("estimate", ""));
                            return comparisonData.estimates[idx]?.name || value;
                          }}
                        />
                        {comparisonData.estimates.map((est, i) => (
                          <Bar
                            key={est.id}
                            dataKey={`estimate${i}`}
                            fill={est.color.bg}
                            radius={[0, 4, 4, 0]}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Detailed Comparison Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="print:break-inside-avoid"
            >
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm overflow-hidden">
                <CardHeader>
                  <CardTitle>Detailed Comparison</CardTitle>
                  <CardDescription>Line-by-line breakdown of each estimate</CardDescription>
                </CardHeader>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-6 py-4 font-medium text-slate-500">Category</th>
                        {comparisonData.estimates.map((est) => (
                          <th key={est.id} className="text-right px-6 py-4 font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: est.color.bg }}
                              />
                              <span className="text-slate-900">{est.name}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {comparisonData.categoryChartData.map((row: any, i: number) => {
                        const values = comparisonData.estimates.map((_, idx) => row[`estimate${idx}`]);
                        const min = Math.min(...values);
                        const max = Math.max(...values);

                        return (
                          <tr key={row.category} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4 font-medium text-slate-700">{row.category}</td>
                            {comparisonData.estimates.map((est, idx) => {
                              const value = row[`estimate${idx}`];
                              const isMin = value === min && min !== max;
                              const isMax = value === max && min !== max;

                              return (
                                <td key={est.id} className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <span
                                      className={`font-mono ${
                                        isMin
                                          ? "text-emerald-600 font-semibold"
                                          : isMax
                                          ? "text-amber-600"
                                          : "text-slate-900"
                                      }`}
                                    >
                                      {formatCurrency(value)}
                                    </span>
                                    {isMin && (
                                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded">
                                        lowest
                                      </span>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}

                      {/* Totals row */}
                      <tr className="bg-slate-50 font-semibold border-t-2 border-slate-200">
                        <td className="px-6 py-4 text-slate-900">Grand Total</td>
                        {comparisonData.estimates.map((est, idx) => {
                          const isLowest = idx === comparisonData.lowestIndex;
                          return (
                            <td key={est.id} className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span
                                  className={`font-mono text-base ${
                                    isLowest ? "text-emerald-600" : "text-slate-900"
                                  }`}
                                >
                                  {formatCurrency(Number(est.grandTotal))}
                                </span>
                                {isLowest && (
                                  <BadgeCheck className="w-4 h-4 text-emerald-500" />
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>

                      {/* Per SF row */}
                      <tr className="bg-slate-50/50">
                        <td className="px-6 py-3 text-slate-500">Per Square Foot</td>
                        {comparisonData.estimates.map((est) => (
                          <td key={est.id} className="px-6 py-3 text-right">
                            <span className="font-mono text-slate-600">
                              ${Number(est.grandTotalPerRSF).toFixed(2)}/SF
                            </span>
                          </td>
                        ))}
                      </tr>

                      {/* Client Total if applicable */}
                      {comparisonData.estimates.some(
                        (e) => Number(e.clientTotal) !== Number(e.grandTotal)
                      ) && (
                        <tr className="bg-emerald-50/50 border-t border-emerald-100">
                          <td className="px-6 py-4 text-emerald-700 font-medium">
                            After TI Allowance
                          </td>
                          {comparisonData.estimates.map((est) => (
                            <td key={est.id} className="px-6 py-4 text-right">
                              <span className="font-mono font-semibold text-emerald-600">
                                {formatCurrency(Number(est.clientTotal))}
                              </span>
                            </td>
                          ))}
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>

            {/* Print Summary Section */}
            <div className="hidden print:block print:break-before-page">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#2F739E]" />
                    Comparison Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <h4 className="font-semibold text-slate-800 mb-2">Budget Range Overview</h4>
                    <p className="text-lg font-bold text-slate-900">
                      {formatCurrency(comparisonData.minTotal)} - {formatCurrency(comparisonData.maxTotal)}
                    </p>
                    {comparisonData.totalSavings > 0 && (
                      <p className="text-sm text-slate-600 mt-1">
                        {formatCurrency(comparisonData.totalSavings)} spread ({Math.abs(comparisonData.savingsPercent).toFixed(1)}% difference between options)
                      </p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Key Insights</h4>
                    <ul className="space-y-2">
                      {comparisonData.insights.slice(0, 3).map((insight, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-[#2F739E] flex-shrink-0 mt-0.5" />
                          {insight.title}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-500">
                      This comparison was generated on {new Date().toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}. Estimates are for planning purposes and may vary based on final scope and specifications.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CTA Section */}
            <motion.div
              className="print:hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-[#2F739E] to-[#1d5a7d] text-white border-none overflow-hidden">
                <CardContent className="p-8 text-center space-y-4">
                  <h3 className="text-2xl font-semibold">Ready to Move Forward?</h3>
                  <p className="text-white/80 max-w-xl mx-auto">
                    Our team can help you refine these estimates and develop a detailed proposal
                    based on your preferred option.
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center pt-2">
                    <Button
                      size="lg"
                      className="bg-white text-[#2F739E] hover:bg-white/90"
                    >
                      Schedule Consultation
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      Ask a Question
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        ) : null}

        {/* Footer */}
        <motion.footer
          className="pt-10 border-t border-slate-200/60 text-center print:pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex flex-col items-center gap-4">
            <img
              src="/Connected_Logo.png"
              alt="Connected"
              className="h-6 w-auto opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 print:opacity-100 print:grayscale-0"
            />
            <p className="text-slate-400 text-sm">
              Comparison prepared{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <p className="text-xs text-slate-400 max-w-md print:hidden">
              These are interactive estimates for planning purposes. Final costs will be confirmed
              after detailed scope review.
            </p>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
