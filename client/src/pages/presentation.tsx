import React, { useMemo, useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation, useSearch } from "wouter";
import { decodeState, encodeState } from "@/lib/url-state";
import { calculateProjectCosts } from "@/lib/calculator-engine";
import { INITIAL_SLIDERS } from "@/lib/calculator-constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SliderGroup } from "@/components/calculator/SliderGroup";
import {
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import {
  Building2,
  MapPin,
  Ruler,
  ArrowLeft,
  Printer,
  Share2,
  TrendingUp,
  Shield,
  Sparkles,
  ChevronDown,
  MessageCircle,
  Calendar,
  CheckCircle2,
  DollarSign,
  Layers,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  X
} from "lucide-react";
import { motion, Variants, AnimatePresence } from "framer-motion";

// Connected Workplaces brand-aligned color palette
const COLORS = ['#2F739E', '#4A90B8', '#6BB6D6', '#8FCCE8', '#B3DDF2', '#D6EEFA'];

// Format large numbers: $6,734,000 -> $6.73M, $132,000 -> $132k
function formatCompactCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  return `$${(value / 1000).toFixed(0)}k`;
}

// Budget Summary Widget Component
interface BudgetSummaryWidgetProps {
  results: ReturnType<typeof calculateProjectCosts>;
  initialResults: ReturnType<typeof calculateProjectCosts> | null;
  onClose: () => void;
  isMobile: boolean;
}

function BudgetSummaryWidget({ results, initialResults, onClose, isMobile }: BudgetSummaryWidgetProps) {
  const totalDiff = initialResults ? results.grandTotal - initialResults.grandTotal : 0;
  const percentChange = initialResults && initialResults.grandTotal > 0
    ? ((totalDiff / initialResults.grandTotal) * 100)
    : 0;

  // Mobile: Bottom sheet style widget
  // Desktop: Fixed sidebar widget
  return (
    <motion.div
      initial={isMobile
        ? { opacity: 0, y: 100 }
        : { opacity: 0, x: 100, scale: 0.9 }
      }
      animate={isMobile
        ? { opacity: 1, y: 0 }
        : { opacity: 1, x: 0, scale: 1 }
      }
      exit={isMobile
        ? { opacity: 0, y: 100 }
        : { opacity: 0, x: 100, scale: 0.9 }
      }
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className={
        isMobile
          ? "fixed bottom-0 left-0 right-0 z-30 print:hidden safe-area-bottom"
          : "fixed right-4 top-24 z-30 w-72 print:hidden"
      }
    >
      <Card className={`bg-white/95 backdrop-blur-xl border-slate-200/60 shadow-2xl shadow-slate-900/10 overflow-hidden ${isMobile ? 'rounded-b-none rounded-t-2xl' : ''}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2F739E] to-[#4A90B8] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-white/80" />
            <span className="text-white font-semibold text-sm">Live Budget</span>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors p-1"
            aria-label="Close budget widget"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <CardContent className={`space-y-4 ${isMobile ? 'p-3' : 'p-4'}`}>
          {/* Mobile: Compact horizontal layout */}
          {isMobile ? (
            <>
              {/* Total Budget - Compact for mobile */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Total Investment</p>
                  <motion.span
                    key={results.grandTotal}
                    initial={{ scale: 1.1, color: '#2F739E' }}
                    animate={{ scale: 1, color: '#0f172a' }}
                    className="text-xl font-bold text-slate-900"
                  >
                    ${results.grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </motion.span>
                </div>
                {totalDiff !== 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full ${
                      totalDiff > 0 ? 'text-rose-600 bg-rose-50' : 'text-emerald-600 bg-emerald-50'
                    }`}
                  >
                    {totalDiff > 0 ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    )}
                    <span>{totalDiff > 0 ? '+' : ''}{percentChange.toFixed(1)}%</span>
                  </motion.div>
                )}
              </div>

              {/* Quick Stats - Horizontal on mobile */}
              <div className="flex gap-2">
                <div className="flex-1 bg-slate-50 rounded-lg p-2 text-center">
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider">Base</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatCompactCurrency(results.subtotal)}
                  </p>
                </div>
                <div className="flex-1 bg-slate-50 rounded-lg p-2 text-center">
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider">Contingency</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatCompactCurrency(results.contingency)}
                  </p>
                </div>
                {results.tiAllowanceTotal > 0 && (
                  <div className="flex-1 bg-emerald-50 rounded-lg p-2 text-center">
                    <p className="text-[9px] text-emerald-600 uppercase tracking-wider">TI</p>
                    <p className="text-sm font-semibold text-emerald-700">
                      -{formatCompactCurrency(results.tiAllowanceTotal)}
                    </p>
                  </div>
                )}
                <div className="flex-1 bg-slate-50 rounded-lg p-2 text-center">
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider">Per SF</p>
                  <p className="text-sm font-semibold text-slate-900">
                    ${results.grandTotalPerRSF.toFixed(0)}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Desktop: Full layout */}
              {/* Total Budget */}
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Investment</p>
                <div className="flex items-end justify-between">
                  <motion.span
                    key={results.grandTotal}
                    initial={{ scale: 1.1, color: '#2F739E' }}
                    animate={{ scale: 1, color: '#0f172a' }}
                    className="text-2xl font-bold text-slate-900"
                  >
                    ${results.grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </motion.span>
                  {totalDiff !== 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-center gap-1 text-sm font-semibold ${
                        totalDiff > 0 ? 'text-rose-500' : 'text-emerald-500'
                      }`}
                    >
                      {totalDiff > 0 ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      <span>{totalDiff > 0 ? '+' : ''}{percentChange.toFixed(1)}%</span>
                    </motion.div>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  ${results.grandTotalPerRSF.toFixed(2)} per sq ft
                </p>
              </div>

              {/* Divider */}
              <div className="h-px bg-slate-100" />

              {/* Category Breakdown - Compact */}
              <div className="space-y-2">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">By Category</p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {results.categories.map((cat, i) => {
                    const initialCat = initialResults?.categories.find(c => c.category === cat.category);
                    const catDiff = initialCat ? cat.totalCost - initialCat.totalCost : 0;

                    return (
                      <motion.div
                        key={cat.category}
                        className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-colors"
                        initial={false}
                        animate={{
                          backgroundColor: catDiff !== 0 ? 'rgba(47, 115, 158, 0.05)' : 'transparent'
                        }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: COLORS[i % COLORS.length] }}
                          />
                          <span className="text-xs text-slate-600 truncate">{cat.category}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <motion.span
                            key={cat.totalCost}
                            initial={{ scale: 1.05 }}
                            animate={{ scale: 1 }}
                            className="text-xs font-medium text-slate-900"
                          >
                            {formatCompactCurrency(cat.totalCost)}
                          </motion.span>
                          {catDiff !== 0 && (
                            <span className={`text-[10px] font-medium ${
                              catDiff > 0 ? 'text-rose-500' : 'text-emerald-500'
                            }`}>
                              {catDiff > 0 ? '+' : ''}{((catDiff / (initialCat?.totalCost || 1)) * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-slate-100" />

              {/* Quick Stats */}
              <div className={`grid ${results.tiAllowanceTotal > 0 ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
                <div className="bg-slate-50 rounded-lg p-2.5">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Base Cost</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatCompactCurrency(results.subtotal)}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Contingency</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatCompactCurrency(results.contingency)}
                  </p>
                </div>
                {results.tiAllowanceTotal > 0 && (
                  <div className="bg-emerald-50 rounded-lg p-2.5">
                    <p className="text-[10px] text-emerald-600 uppercase tracking-wider">TI Allowance</p>
                    <p className="text-sm font-semibold text-emerald-700">
                      -{formatCompactCurrency(results.tiAllowanceTotal)}
                    </p>
                  </div>
                )}
              </div>

              {/* Reset hint */}
              {totalDiff !== 0 && (
                <p className="text-[10px] text-center text-slate-400">
                  Comparing to your original estimate
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function PresentationPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const [showCustomization, setShowCustomization] = useState(false);
  const [showBudgetWidget, setShowBudgetWidget] = useState(true);
  const [initialResults, setInitialResults] = useState<ReturnType<typeof calculateProjectCosts> | null>(null);
  const isMobile = useIsMobile();

  const state = useMemo(() => {
    const params = new URLSearchParams(search);
    const data = params.get("data");
    if (!data) return null;
    return decodeState(data);
  }, [search]);

  useEffect(() => {
    if (!state) {
      // setLocation("/");
    }
  }, [state, setLocation]);

  // Local mutable state for sliders (interactive)
  const [sliderValues, setSliderValues] = useState<Record<string, number>>(
    () => state?.sliderValues || {}
  );

  // Update slider values when state changes (e.g., from URL)
  useEffect(() => {
    if (state?.sliderValues) {
      setSliderValues(state.sliderValues);
    }
  }, [state]);

  const handleSliderChange = (id: string, value: number) => {
    setSliderValues((prev) => ({ ...prev, [id]: value }));
  };

  // Inputs and baseValues remain read-only from URL
  const inputs = state?.inputs || { projectName: "Project", projectSize: 25000, floors: 1, location: "New York, NY" };
  const baseValues = state?.baseValues;

  // Recalculate results when sliders change
  const results = useMemo(() => {
    return calculateProjectCosts(inputs, sliderValues, baseValues);
  }, [inputs, sliderValues, baseValues]);

  // Capture initial results when customization is first opened
  useEffect(() => {
    if (showCustomization && !initialResults) {
      setInitialResults(results);
      setShowBudgetWidget(true);
    }
  }, [showCustomization, initialResults, results]);

  // Update URL when sliders change (for sharing current state)
  useEffect(() => {
    if (state && Object.keys(sliderValues).length > 0) {
      const stateString = encodeState(inputs, sliderValues, baseValues);
      window.history.replaceState(null, '', `${window.location.pathname}?data=${stateString}`);
    }
  }, [sliderValues, inputs, baseValues, state]);

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <motion.div
          className="text-center space-y-6 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No Project Found</h2>
            <p className="text-slate-500">This estimate link may have expired or is invalid.</p>
          </div>
          <Button onClick={() => setLocation("/")} className="bg-[#2F739E] hover:bg-[#1d5a7d]">
            Start New Estimate
          </Button>
        </motion.div>
      </div>
    );
  }

  const chartData = results.categories.map(cat => ({
    name: cat.category,
    value: cat.totalCost,
    perRSF: cat.costPerRSF
  }));

  // Sort by value for the bar chart
  const sortedChartData = [...chartData].sort((a, b) => b.value - a.value);

  const handlePrint = () => {
    window.print();
  };

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
  };

  // Find the largest category
  const largestCategory = sortedChartData[0];
  const largestCategoryPercent = ((largestCategory.value / results.subtotal) * 100).toFixed(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 selection:bg-[#2F739E]/20 relative overflow-hidden">
      {/* Subtle gradient background overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, rgba(47, 115, 158, 0.05) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(74, 144, 184, 0.04) 0%, transparent 50%)'
        }}
      />

      {/* Blueprint Grid Background Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: 'radial-gradient(#2F739E 0.5px, transparent 0.5px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Navigation */}
      <nav className="print:hidden sticky top-0 z-20 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 px-4 md:px-6 py-3 flex justify-between items-center transition-all duration-500">
        <div className="flex items-center gap-3">
          <motion.img
            src="/Connected_Logo.png"
            alt="Connected Logo"
            className="h-8 w-auto"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="hidden sm:block"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="text-slate-500 hover:text-[#2F739E] hover:bg-[#2F739E]/5 transition-all duration-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </motion.div>
        </div>
        <motion.div
          className="flex gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="hover:bg-slate-50 hover:text-slate-900 border-slate-200 hover:border-[#2F739E]/30 transition-all duration-300"
          >
            <Printer className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </Button>
          <Button
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Link copied to clipboard!");
            }}
            className="bg-[#2F739E] hover:bg-[#1d5a7d] text-white shadow-md hover:shadow-lg hover:shadow-[#2F739E]/20 transition-all duration-300"
          >
            <Share2 className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        </motion.div>
      </nav>

      {/* Budget Summary Widget - Shows when customizing */}
      <AnimatePresence>
        {showCustomization && showBudgetWidget && (
          <BudgetSummaryWidget
            results={results}
            initialResults={initialResults}
            onClose={() => setShowBudgetWidget(false)}
            isMobile={isMobile}
          />
        )}
      </AnimatePresence>

      <motion.div
        className={`max-w-5xl mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12 space-y-10 md:space-y-16 relative z-10 ${showCustomization && showBudgetWidget && isMobile ? 'pb-36' : ''}`}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >

        {/* Hero Section - First Impression */}
        <motion.section variants={itemVariants} className="text-center space-y-6">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2F739E]/10 text-sm font-medium text-[#2F739E]"
            whileHover={{ scale: 1.02 }}
          >
            <Sparkles className="w-4 h-4" />
            Your Personalized Project Estimate
          </motion.div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-slate-900 leading-tight tracking-tight">
            {inputs.projectName || "Your New Workspace"}
          </h1>

          <div className="flex flex-wrap justify-center gap-3 text-slate-600">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200/60 shadow-sm text-sm">
              <MapPin className="h-4 w-4 text-[#2F739E]" />
              <span>{inputs.location}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200/60 shadow-sm text-sm">
              <Ruler className="h-4 w-4 text-[#2F739E]" />
              <span>{inputs.projectSize.toLocaleString()} sq ft</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200/60 shadow-sm text-sm">
              <Layers className="h-4 w-4 text-[#2F739E]" />
              <span>{inputs.floors} Floor{inputs.floors > 1 ? 's' : ''}</span>
            </div>
            {results.tiAllowancePerSF > 0 && (
              <div className="flex items-center gap-2 bg-emerald-50 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-200/60 shadow-sm text-sm text-emerald-700">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                <span>TI Allowance: ${results.tiAllowancePerSF.toFixed(2)}/SF</span>
              </div>
            )}
          </div>
        </motion.section>

        {/* Main Investment Card - The Big Number */}
        <motion.section variants={itemVariants}>
          <Card className="bg-gradient-to-br from-[#2F739E] via-[#2a6a92] to-[#1d5a7d] text-white border-none shadow-2xl overflow-hidden relative">
            <div
              className="absolute inset-0 z-0 opacity-20"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.12) 1px, transparent 0)`,
                backgroundSize: '20px 20px'
              }}
            />
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -ml-24 -mb-24 pointer-events-none" />

            <CardContent className="relative z-10 p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <p className="text-white/70 text-sm font-medium uppercase tracking-wider">
                    {results.tiAllowanceTotal > 0 ? 'Your Investment (After TI Allowance)' : 'Estimated Total Investment'}
                  </p>
                  <div className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                    ${(results.tiAllowanceTotal > 0 ? results.clientTotal : results.grandTotal).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <p className="text-white/80 text-lg">
                    <span className="font-semibold">${(results.tiAllowanceTotal > 0 ? results.clientTotalPerRSF : results.grandTotalPerRSF).toFixed(2)}</span> per square foot
                  </p>
                </div>

                <div className={`grid ${results.tiAllowanceTotal > 0 ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 min-w-0">
                    <div className="flex items-center gap-1.5 text-white/70 text-[10px] font-medium uppercase tracking-wider mb-1">
                      <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">Base Cost</span>
                    </div>
                    <div className="text-lg md:text-xl font-bold truncate">
                      {formatCompactCurrency(results.subtotal)}
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 min-w-0">
                    <div className="flex items-center gap-1.5 text-white/70 text-[10px] font-medium uppercase tracking-wider mb-1">
                      <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">Contingency</span>
                    </div>
                    <div className="text-lg md:text-xl font-bold truncate">
                      {formatCompactCurrency(results.contingency)}
                    </div>
                    <div className="text-white/60 text-[10px] mt-0.5">
                      {(results.contingencyPercent * 100).toFixed(0)}% buffer
                    </div>
                  </div>
                  {results.tiAllowanceTotal > 0 && (
                    <div className="bg-emerald-500/20 backdrop-blur-sm rounded-xl p-3 border border-emerald-400/30 min-w-0">
                      <div className="flex items-center gap-1.5 text-emerald-200 text-[10px] font-medium uppercase tracking-wider mb-1">
                        <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">TI Allowance</span>
                      </div>
                      <div className="text-lg md:text-xl font-bold text-emerald-100 truncate">
                        -{formatCompactCurrency(results.tiAllowanceTotal)}
                      </div>
                      <div className="text-emerald-200/70 text-[10px] mt-0.5">
                        ${results.tiAllowancePerSF.toFixed(2)}/SF
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* What's Included - Visual Breakdown */}
        <motion.section variants={itemVariants} className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">
              What's Included in Your Estimate
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Your investment covers everything needed to bring your workspace to life
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Bar Chart - More intuitive for comparing categories */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm overflow-hidden">
              <CardContent className="p-4 md:p-6">
                <div className="h-[280px] md:h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={sortedChartData}
                      layout="vertical"
                      margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={true} vertical={false} />
                      <XAxis
                        type="number"
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                        stroke="#94a3b8"
                        fontSize={12}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={100}
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                      />
                      <RechartsTooltip
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Total']}
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid rgba(47, 115, 158, 0.2)',
                          boxShadow: '0 10px 40px -10px rgba(47, 115, 158, 0.3)',
                          backgroundColor: 'rgba(255, 255, 255, 0.95)'
                        }}
                      />
                      <Bar
                        dataKey="value"
                        fill="#2F739E"
                        radius={[0, 4, 4, 0]}
                        animationDuration={1000}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Cards */}
            <div className="space-y-3">
              {sortedChartData.map((cat, i) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (i * 0.05), duration: 0.4 }}
                >
                  <Card className="bg-white/60 backdrop-blur-sm border-slate-200/40 hover:border-[#2F739E]/20 hover:shadow-md transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[i % COLORS.length] }}
                          />
                          <span className="font-medium text-slate-700">{cat.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-slate-900">
                            ${cat.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </div>
                          <div className="text-xs text-slate-500">
                            ${cat.perRSF.toFixed(2)}/sf
                          </div>
                        </div>
                      </div>
                      {/* Progress bar showing proportion */}
                      <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(cat.value / results.subtotal) * 100}%` }}
                          transition={{ delay: 0.5 + (i * 0.05), duration: 0.6, ease: "easeOut" }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Key Insight */}
          <motion.div
            className="bg-gradient-to-r from-[#2F739E]/5 to-[#4A90B8]/5 rounded-2xl p-6 border border-[#2F739E]/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#2F739E]/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-[#2F739E]" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Investment Insight</h4>
                <p className="text-slate-600">
                  <strong className="text-[#2F739E]">{largestCategory.name}</strong> represents your largest investment at{' '}
                  <strong>{largestCategoryPercent}%</strong> of the project budget. This is typical for workspace projects
                  where build quality directly impacts employee experience and long-term durability.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Customize Your Project - Expandable */}
        <motion.section variants={itemVariants} className="space-y-6">
          <button
            onClick={() => setShowCustomization(!showCustomization)}
            className="w-full text-left"
          >
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm hover:shadow-md hover:border-[#2F739E]/20 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2F739E] to-[#4A90B8] flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">
                        Customize Your Project
                      </h3>
                      <p className="text-slate-500 text-sm mt-1">
                        Adjust quality levels to see how they affect your budget
                      </p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: showCustomization ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-6 h-6 text-slate-400" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </button>

          <AnimatePresence>
            {showCustomization && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 overflow-hidden"
              >
                <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-4 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-800 text-sm">
                    <strong>Tip:</strong> Drag the sliders to explore different quality options.
                    Higher quality typically means more durable materials and premium finishes
                    that enhance your workspace experience.
                  </p>
                </div>

                <SliderGroup
                  title="Construction & Build Quality"
                  sliders={INITIAL_SLIDERS.construction}
                  values={sliderValues}
                  onValueChange={handleSliderChange}
                  clientMode={true}
                  defaultOpen={true}
                />

                <SliderGroup
                  title="Furniture, Fixtures & Equipment"
                  sliders={INITIAL_SLIDERS.ffeAppliances}
                  values={sliderValues}
                  onValueChange={handleSliderChange}
                  clientMode={true}
                  defaultOpen={false}
                />

                <SliderGroup
                  title="Technology & AV Systems"
                  sliders={INITIAL_SLIDERS.technology}
                  values={sliderValues}
                  onValueChange={handleSliderChange}
                  clientMode={true}
                  defaultOpen={false}
                />

                <SliderGroup
                  title="Branding & Signage"
                  sliders={INITIAL_SLIDERS.signage}
                  values={sliderValues}
                  onValueChange={handleSliderChange}
                  clientMode={true}
                  defaultOpen={false}
                />

                <SliderGroup
                  title="Design & Professional Fees"
                  sliders={INITIAL_SLIDERS.designFees}
                  values={sliderValues}
                  onValueChange={handleSliderChange}
                  clientMode={true}
                  defaultOpen={false}
                />

                <SliderGroup
                  title="Additional Services"
                  sliders={INITIAL_SLIDERS.other}
                  values={sliderValues}
                  onValueChange={handleSliderChange}
                  clientMode={true}
                  defaultOpen={false}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* What Happens Next - CTA Section */}
        <motion.section variants={itemVariants}>
          <Card className="bg-white border-slate-200/60 shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2">
                <div className="p-8 md:p-10 space-y-6">
                  <h3 className="text-2xl font-semibold text-slate-900">
                    Ready to Move Forward?
                  </h3>
                  <p className="text-slate-600">
                    This estimate is your starting point. Our team is ready to refine these numbers
                    and create a detailed proposal tailored to your specific needs.
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-slate-900">Detailed scope review</p>
                        <p className="text-sm text-slate-500">We'll walk through every line item together</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-slate-900">Timeline planning</p>
                        <p className="text-sm text-slate-500">Get a realistic schedule for your project</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-slate-900">Value engineering options</p>
                        <p className="text-sm text-slate-500">Identify ways to optimize your budget</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-8 md:p-10 flex flex-col justify-center space-y-4">
                  <Button
                    size="lg"
                    className="w-full bg-[#2F739E] hover:bg-[#1d5a7d] text-white shadow-lg hover:shadow-xl transition-all duration-300 py-6 text-base"
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    Schedule a Consultation
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-slate-300 hover:border-[#2F739E]/30 hover:bg-white transition-all duration-300 py-6 text-base"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Ask a Question
                  </Button>
                  <p className="text-center text-xs text-slate-500 mt-2">
                    No commitment required. Let's talk about your vision.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Detailed Table - For those who want the specifics */}
        <motion.section variants={itemVariants} className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-900">Detailed Cost Breakdown</h3>
            <span className="text-sm text-slate-500">For reference</span>
          </div>

          <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200/60">
                  <tr>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4 text-right">Cost/SF</th>
                    <th className="px-6 py-4 text-right">Total Cost</th>
                    <th className="px-6 py-4 text-right">% of Budget</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.categories.map((cat, i) => (
                    <tr
                      key={cat.category}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-slate-700">{cat.category}</td>
                      <td className="px-6 py-4 text-right text-slate-500 font-mono">${cat.costPerRSF.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-slate-900 font-mono font-medium">${cat.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td className="px-6 py-4 text-right text-slate-500">
                        {((cat.totalCost / results.subtotal) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-semibold border-t-2 border-slate-200">
                    <td className="px-6 py-4 text-slate-900">Subtotal</td>
                    <td className="px-6 py-4 text-right font-mono text-slate-900">
                      ${(results.subtotal / inputs.projectSize).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-900">
                      ${results.subtotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500">100%</td>
                  </tr>
                  <tr className="bg-amber-50/50">
                    <td className="px-6 py-4 text-slate-700">
                      Contingency ({(results.contingencyPercent * 100).toFixed(0)}%)
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-500">
                      ${(results.contingency / inputs.projectSize).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-700">
                      ${results.contingency.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500">—</td>
                  </tr>
                  <tr className="bg-slate-100/50 font-semibold">
                    <td className="px-6 py-4 text-slate-900">Grand Total</td>
                    <td className="px-6 py-4 text-right font-mono text-slate-900">
                      ${results.grandTotalPerRSF.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-900">
                      ${results.grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-6 py-4"></td>
                  </tr>
                  {results.tiAllowanceTotal > 0 && (
                    <>
                      <tr className="bg-emerald-50/50">
                        <td className="px-6 py-4 text-emerald-700 font-medium">
                          TI Allowance (${results.tiAllowancePerSF.toFixed(2)}/SF)
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-emerald-600">
                          -${results.tiAllowancePerSF.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-emerald-600 font-medium">
                          -${results.tiAllowanceTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-6 py-4 text-right text-emerald-500 text-xs">
                          Building owner credit
                        </td>
                      </tr>
                      <tr className="bg-[#2F739E]/5 font-bold border-t-2 border-[#2F739E]/20">
                        <td className="px-6 py-5 text-[#2F739E] text-base">Your Investment</td>
                        <td className="px-6 py-5 text-right font-mono text-[#2F739E] text-base">
                          ${results.clientTotalPerRSF.toFixed(2)}
                        </td>
                        <td className="px-6 py-5 text-right font-mono text-[#2F739E] text-base">
                          ${results.clientTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-6 py-5"></td>
                      </tr>
                    </>
                  )}
                  {results.tiAllowanceTotal === 0 && (
                    <tr className="bg-[#2F739E]/5 font-bold border-t-2 border-[#2F739E]/20">
                      <td className="px-6 py-5 text-[#2F739E] text-base">Your Investment</td>
                      <td className="px-6 py-5 text-right font-mono text-[#2F739E] text-base">
                        ${results.grandTotalPerRSF.toFixed(2)}
                      </td>
                      <td className="px-6 py-5 text-right font-mono text-[#2F739E] text-base">
                        ${results.grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-6 py-5"></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.section>

        {/* Footer */}
        <motion.footer
          className="pt-10 border-t border-slate-200/60 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <div className="flex flex-col items-center gap-4">
            <img
              src="/Connected_Logo.png"
              alt="Connected"
              className="h-6 w-auto opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500"
            />
            <p className="text-slate-400 text-sm">
              Estimate prepared {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <p className="text-xs text-slate-400 max-w-md">
              This is an interactive estimate for planning purposes. Final costs will be confirmed
              after detailed scope review and site assessment.
            </p>
          </div>
        </motion.footer>

      </motion.div>
    </div>
  );
}
