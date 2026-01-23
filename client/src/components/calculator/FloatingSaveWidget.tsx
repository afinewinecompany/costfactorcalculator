import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Save,
  Loader2,
  BookmarkCheck,
  GitCompare,
  X,
  ChevronUp,
  ChevronDown,
  DollarSign,
  AlertCircle,
  Check,
} from "lucide-react";
import { calculateProjectCosts } from "@/lib/calculator-engine";

// Format large numbers: $6,734,000 -> $6.73M, $132,000 -> $132k
function formatCompactCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  return `$${(value / 1000).toFixed(0)}k`;
}

interface FloatingSaveWidgetProps {
  results: ReturnType<typeof calculateProjectCosts>;
  isMobile: boolean;
  hasUnsavedChanges: boolean;
  savedEstimateId: string | null;
  projectId: string | null;
  estimateName: string;
  estimateDescription: string;
  isSaving: boolean;
  onEstimateNameChange: (name: string) => void;
  onEstimateDescriptionChange: (description: string) => void;
  onSaveEstimate: () => void;
  onNavigateToCompare: () => void;
  onResetSavedState: () => void;
}

export function FloatingSaveWidget({
  results,
  isMobile,
  hasUnsavedChanges,
  savedEstimateId,
  projectId,
  estimateName,
  estimateDescription,
  isSaving,
  onEstimateNameChange,
  onEstimateDescriptionChange,
  onSaveEstimate,
  onNavigateToCompare,
  onResetSavedState,
}: FloatingSaveWidgetProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showSaveSheet, setShowSaveSheet] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Reset just saved state after animation
  useEffect(() => {
    if (savedEstimateId && justSaved) {
      const timer = setTimeout(() => {
        setJustSaved(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [savedEstimateId, justSaved]);

  // Track when save completes
  const prevSavedEstimateIdRef = useRef(savedEstimateId);
  useEffect(() => {
    if (savedEstimateId && !prevSavedEstimateIdRef.current) {
      setJustSaved(true);
      setShowSaveSheet(false);
    }
    prevSavedEstimateIdRef.current = savedEstimateId;
  }, [savedEstimateId]);

  const handleSaveClick = () => {
    if (savedEstimateId) {
      // Already saved, allow saving new version
      onResetSavedState();
    }
    setShowSaveSheet(true);
  };

  const handleSaveSubmit = () => {
    onSaveEstimate();
  };

  // Collapsed pill view (mobile and desktop)
  if (isCollapsed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={`
          fixed z-40 print:hidden
          ${isMobile
            ? "bottom-4 right-4 left-4"
            : "bottom-6 right-6"
          }
        `}
        style={isMobile ? { paddingBottom: "env(safe-area-inset-bottom)" } : {}}
      >
        <motion.button
          onClick={() => setIsCollapsed(false)}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-full
            bg-white/95 backdrop-blur-xl border border-slate-200/60
            shadow-lg shadow-slate-900/10 hover:shadow-xl
            transition-all duration-300
            ${isMobile ? "w-full justify-between" : ""}
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#2F739E] flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <p className="text-xs text-slate-500 font-medium">Total</p>
              <p className="text-sm font-bold text-slate-900">
                {formatCompactCurrency(results.tiAllowanceTotal > 0 ? results.clientTotal : results.grandTotal)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && !savedEstimateId && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
            <ChevronUp className="w-5 h-5 text-slate-400" />
          </div>
        </motion.button>
      </motion.div>
    );
  }

  // Expanded widget view
  return (
    <>
      <motion.div
        initial={isMobile
          ? { opacity: 0, y: 100 }
          : { opacity: 0, y: 50, scale: 0.95 }
        }
        animate={isMobile
          ? { opacity: 1, y: 0 }
          : { opacity: 1, y: 0, scale: 1 }
        }
        exit={isMobile
          ? { opacity: 0, y: 100 }
          : { opacity: 0, y: 50, scale: 0.95 }
        }
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={`
          fixed z-40 print:hidden
          ${isMobile
            ? "bottom-0 left-0 right-0"
            : "bottom-6 right-6 w-80"
          }
        `}
        style={isMobile ? { paddingBottom: "env(safe-area-inset-bottom)" } : {}}
      >
        <Card className={`
          bg-white/95 backdrop-blur-xl border-slate-200/60
          shadow-2xl shadow-slate-900/10 overflow-hidden
          ${isMobile ? "rounded-b-none rounded-t-2xl" : "rounded-2xl"}
        `}>
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2F739E] to-[#4A90B8] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-white/80" />
              <span className="text-white font-semibold text-sm">Estimate Summary</span>
              {hasUnsavedChanges && !savedEstimateId && (
                <span className="flex items-center gap-1 text-amber-200 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  Unsaved
                </span>
              )}
              {savedEstimateId && justSaved && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1 text-emerald-200 text-xs"
                >
                  <Check className="w-3 h-3" />
                  Saved!
                </motion.span>
              )}
            </div>
            <button
              onClick={() => setIsCollapsed(true)}
              className="text-white/60 hover:text-white transition-colors p-1"
              aria-label="Collapse widget"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <CardContent className={`space-y-4 ${isMobile ? "p-3" : "p-4"}`}>
            {/* Budget Summary */}
            {isMobile ? (
              // Mobile: Compact horizontal layout
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                    {results.tiAllowanceTotal > 0 ? "Your Investment" : "Total Budget"}
                  </p>
                  <motion.span
                    key={results.grandTotal}
                    initial={{ scale: 1.05, color: "#2F739E" }}
                    animate={{ scale: 1, color: "#0f172a" }}
                    className="text-xl font-bold text-slate-900 block"
                  >
                    ${(results.tiAllowanceTotal > 0 ? results.clientTotal : results.grandTotal).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </motion.span>
                </div>
                <div className="flex gap-2 text-center">
                  <div className="bg-slate-50 rounded-lg px-3 py-2">
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider">$/SF</p>
                    <p className="text-sm font-semibold text-slate-900">
                      ${(results.tiAllowanceTotal > 0 ? results.clientTotalPerRSF : results.grandTotalPerRSF).toFixed(0)}
                    </p>
                  </div>
                  {results.tiAllowanceTotal > 0 && (
                    <div className="bg-emerald-50 rounded-lg px-3 py-2">
                      <p className="text-[9px] text-emerald-600 uppercase tracking-wider">TI</p>
                      <p className="text-sm font-semibold text-emerald-700">
                        -{formatCompactCurrency(results.tiAllowanceTotal)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Desktop: Vertical layout with more detail
              <>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                    {results.tiAllowanceTotal > 0 ? "Your Investment" : "Total Budget"}
                  </p>
                  <motion.div
                    key={results.grandTotal}
                    initial={{ scale: 1.02 }}
                    animate={{ scale: 1 }}
                    className="flex items-baseline justify-between"
                  >
                    <span className="text-2xl font-bold text-slate-900">
                      ${(results.tiAllowanceTotal > 0 ? results.clientTotal : results.grandTotal).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-sm text-slate-500">
                      ${(results.tiAllowanceTotal > 0 ? results.clientTotalPerRSF : results.grandTotalPerRSF).toFixed(2)}/SF
                    </span>
                  </motion.div>
                </div>

                {results.tiAllowanceTotal > 0 && (
                  <div className="flex gap-2">
                    <div className="flex-1 bg-slate-50 rounded-lg p-2.5">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Grand Total</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {formatCompactCurrency(results.grandTotal)}
                      </p>
                    </div>
                    <div className="flex-1 bg-emerald-50 rounded-lg p-2.5">
                      <p className="text-[10px] text-emerald-600 uppercase tracking-wider">TI Allowance</p>
                      <p className="text-sm font-semibold text-emerald-700">
                        -{formatCompactCurrency(results.tiAllowanceTotal)}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Action Buttons */}
            <div className={`flex gap-2 ${isMobile ? "pt-1" : "pt-2"}`}>
              {savedEstimateId && projectId ? (
                // Show Compare option when already saved
                <>
                  <Button
                    variant="outline"
                    onClick={handleSaveClick}
                    className="flex-1 border-slate-200 hover:border-[#2F739E]/30 text-sm"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save New
                  </Button>
                  <Button
                    onClick={onNavigateToCompare}
                    className="flex-1 bg-[#2F739E] hover:bg-[#1d5a7d] text-sm"
                  >
                    <GitCompare className="w-4 h-4 mr-2" />
                    Compare
                  </Button>
                </>
              ) : (
                // Primary save action
                <Button
                  onClick={handleSaveClick}
                  className="w-full bg-[#2F739E] hover:bg-[#1d5a7d] text-sm shadow-md hover:shadow-lg transition-all"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Estimate
                  {hasUnsavedChanges && (
                    <span className="ml-2 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Sheet/Modal */}
      <Sheet open={showSaveSheet} onOpenChange={setShowSaveSheet}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className={isMobile ? "rounded-t-2xl" : ""}
        >
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Save className="w-5 h-5 text-[#2F739E]" />
              Save Your Estimate
            </SheetTitle>
            <SheetDescription>
              Give your estimate a name to save it for later comparison.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 mt-6">
            <div>
              <Label htmlFor="estimateName" className="text-sm text-slate-700">
                Estimate Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="estimateName"
                placeholder="e.g., Option A - Premium Finishes"
                value={estimateName}
                onChange={(e) => onEstimateNameChange(e.target.value)}
                className="mt-1.5"
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="estimateDescription" className="text-sm text-slate-700">
                Notes (optional)
              </Label>
              <Textarea
                id="estimateDescription"
                placeholder="Add any notes about this estimate version..."
                value={estimateDescription}
                onChange={(e) => onEstimateDescriptionChange(e.target.value)}
                className="mt-1.5 resize-none"
                rows={3}
              />
            </div>

            {/* Summary Preview */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                Estimate Snapshot
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-500">Total Budget</p>
                  <p className="text-lg font-bold text-slate-900">
                    ${results.grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Cost per SF</p>
                  <p className="text-lg font-bold text-slate-900">
                    ${results.grandTotalPerRSF.toFixed(0)}
                  </p>
                </div>
              </div>
              {results.tiAllowanceTotal > 0 && (
                <div className="pt-2 border-t border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-emerald-600">After TI Allowance</span>
                    <span className="font-semibold text-emerald-700">
                      ${results.clientTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowSaveSheet(false)}
                className="flex-1"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveSubmit}
                disabled={isSaving || !estimateName.trim()}
                className="flex-1 bg-[#2F739E] hover:bg-[#1d5a7d]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Estimate
                  </>
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default FloatingSaveWidget;
