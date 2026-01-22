import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

interface EstimateWithColors extends SavedEstimate {
  color: typeof ESTIMATE_COLORS[number];
  colorIndex: number;
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function formatCompactCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  return `$${(value / 1000).toFixed(0)}k`;
}

function getPercentDiff(base: number, compare: number): number {
  if (base === 0) return 0;
  return ((compare - base) / base) * 100;
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

  // Add colors to selected estimates
  const coloredEstimates: EstimateWithColors[] = useMemo(() => {
    if (!selectedEstimates) return [];
    return selectedEstimates.map((est: SavedEstimate, i: number) => ({
      ...est,
      color: ESTIMATE_COLORS[i % ESTIMATE_COLORS.length],
      colorIndex: i,
    }));
  }, [selectedEstimates]);

  // Auto-collapse selector when estimates are selected
  useEffect(() => {
    if (selectedEstimateIds.length >= 2) {
      setShowEstimateSelector(false);
    }
  }, [selectedEstimateIds.length]);

  // Calculate comparison data
  const comparisonData = useMemo(() => {
    if (coloredEstimates.length < 2) return null;

    const estimates = coloredEstimates;
    const baseEstimate = estimates[0];

    // Find min/max totals
    const totals = estimates.map((e) => Number(e.grandTotal));
    const minTotal = Math.min(...totals);
    const maxTotal = Math.max(...totals);
    const lowestIndex = totals.indexOf(minTotal);
    const highestIndex = totals.indexOf(maxTotal);

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

    // Generate insights
    const insights: { type: "savings" | "warning" | "info"; text: string }[] = [];

    // Savings insight
    if (maxTotal > minTotal) {
      const savings = maxTotal - minTotal;
      insights.push({
        type: "savings",
        text: `${estimates[lowestIndex].name} saves ${formatCurrency(savings)} (${Math.abs(
          getPercentDiff(maxTotal, minTotal)
        ).toFixed(1)}% less) compared to ${estimates[highestIndex].name}`,
      });
    }

    // Category-specific insights
    categories.forEach((cat: any) => {
      const catValues = estimates.map((est) => {
        const estCat = est.computedOutput?.categories?.find(
          (c: any) => c.category === cat.category
        );
        return { est, value: estCat?.totalCost || 0 };
      });

      const minCat = Math.min(...catValues.map((c) => c.value));
      const maxCat = Math.max(...catValues.map((c) => c.value));

      if (maxCat > 0 && getPercentDiff(minCat, maxCat) > 20) {
        const minEst = catValues.find((c) => c.value === minCat)?.est;
        const maxEst = catValues.find((c) => c.value === maxCat)?.est;
        insights.push({
          type: "info",
          text: `${cat.category}: ${maxEst?.name} allocates ${Math.abs(
            getPercentDiff(minCat, maxCat)
          ).toFixed(0)}% more than ${minEst?.name}`,
        });
      }
    });

    // Similar budgets insight
    const totalRange = getPercentDiff(minTotal, maxTotal);
    if (totalRange < 5 && estimates.length > 1) {
      insights.push({
        type: "info",
        text: `All options are within ${totalRange.toFixed(1)}% of each other - differences are primarily in how the budget is allocated`,
      });
    }

    return {
      estimates,
      lowestIndex,
      highestIndex,
      minTotal,
      maxTotal,
      categoryChartData,
      insights: insights.slice(0, 5), // Limit to 5 insights
    };
  }, [coloredEstimates]);

  const handleToggleEstimate = (id: string) => {
    setSelectedEstimateIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((eid) => eid !== id);
      }
      if (prev.length >= 4) {
        // Max 4 estimates
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
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="hover:bg-slate-50 hover:text-slate-900 border-slate-200"
        >
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
      </nav>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Header */}
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2F739E]/10 text-sm font-medium text-[#2F739E]">
            <Scale className="w-4 h-4" />
            Budget Comparison
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
            {projectData.name}
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
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
                                    <span className="text-slate-300">•</span>
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
            {/* Summary Cards */}
            <motion.div
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
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

                return (
                  <motion.div
                    key={estimate.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
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
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-slate-900 line-clamp-2 leading-tight">
                            {estimate.name}
                          </h4>
                          {isLowest && comparisonData.estimates.length > 1 && (
                            <Badge className="bg-emerald-100 text-emerald-700 border-0 flex-shrink-0">
                              Lowest
                            </Badge>
                          )}
                          {isHighest && comparisonData.estimates.length > 1 && !isLowest && (
                            <Badge className="bg-amber-100 text-amber-700 border-0 flex-shrink-0">
                              Highest
                            </Badge>
                          )}
                        </div>

                        <div>
                          <p className="text-2xl font-bold text-slate-900">
                            {formatCurrency(grandTotal)}
                          </p>
                          <p className="text-sm text-slate-500">${perSF.toFixed(0)} per SF</p>
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
                            <p className="text-xs text-slate-500">vs lowest option</p>
                            <p className="text-sm font-medium text-rose-600">
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

            {/* Key Insights */}
            {comparisonData.insights.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-gradient-to-br from-[#2F739E]/5 to-[#4A90B8]/5 border-[#2F739E]/20">
                  <button
                    onClick={() => setExpandedInsights(!expandedInsights)}
                    className="w-full text-left"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#2F739E]/10 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-[#2F739E]" />
                          </div>
                          <CardTitle className="text-lg">Key Insights</CardTitle>
                        </div>
                        {expandedInsights ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </CardHeader>
                  </button>

                  <AnimatePresence>
                    {expandedInsights && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <CardContent className="pt-0 space-y-3">
                          {comparisonData.insights.map((insight, i) => (
                            <motion.div
                              key={i}
                              className="flex items-start gap-3 p-3 bg-white/60 rounded-lg"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                            >
                              {insight.type === "savings" && (
                                <TrendingDown className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                              )}
                              {insight.type === "warning" && (
                                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                              )}
                              {insight.type === "info" && (
                                <TrendingUp className="w-5 h-5 text-[#2F739E] flex-shrink-0 mt-0.5" />
                              )}
                              <p className="text-sm text-slate-700">{insight.text}</p>
                            </motion.div>
                          ))}
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            )}

            {/* Category Comparison Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
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
                  <div className="h-[400px]">
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
                                  <span
                                    className={`font-mono ${
                                      isMin
                                        ? "text-emerald-600 font-semibold"
                                        : isMax
                                        ? "text-rose-600"
                                        : "text-slate-900"
                                    }`}
                                  >
                                    {formatCurrency(value)}
                                  </span>
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
                              <span
                                className={`font-mono text-base ${
                                  isLowest ? "text-emerald-600" : "text-slate-900"
                                }`}
                              >
                                {formatCurrency(Number(est.grandTotal))}
                              </span>
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
