import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Settings,
  ChevronDown,
  Lock,
  Unlock,
  AlertTriangle,
  RotateCcw,
  Scale,
  MapPin,
  Building,
  Percent,
} from "lucide-react";
import {
  PROJECT_SIZE_RANGES,
  FLOOR_FACTORS,
  LOCATIONS,
  DEFAULT_CONTINGENCY_PERCENT,
  INITIAL_SLIDERS,
} from "@/lib/calculator-constants";

interface SliderWeightConfig {
  id: string;
  label: string;
  weight: number;
  lowFactor: number;
  highFactor: number;
}

interface AdminSectionProps {
  // Currently read-only display of system constants
  // Future: callbacks for persisting changes
}

export function AdminSection({}: AdminSectionProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Local state for editable values (display only for now)
  const [contingencyPercent, setContingencyPercent] = useState(
    DEFAULT_CONTINGENCY_PERCENT * 100
  );

  const [sizeFactors, setSizeFactors] = useState(
    PROJECT_SIZE_RANGES.map((r) => ({ ...r }))
  );

  const [floorFactors, setFloorFactors] = useState({ ...FLOOR_FACTORS });

  const [locationFactors, setLocationFactors] = useState(
    LOCATIONS.map((l) => ({ ...l }))
  );

  const [sliderConfigs, setSliderConfigs] = useState(() => {
    const configs: Record<string, SliderWeightConfig[]> = {};
    Object.entries(INITIAL_SLIDERS).forEach(([category, sliders]) => {
      configs[category] = sliders.map((s) => ({
        id: s.id,
        label: s.label,
        weight: s.weight,
        lowFactor: s.lowFactor,
        highFactor: s.highFactor,
      }));
    });
    return configs;
  });

  const handleSliderWeightChange = (
    category: string,
    sliderId: string,
    field: "weight" | "lowFactor" | "highFactor",
    value: number
  ) => {
    setSliderConfigs((prev) => ({
      ...prev,
      [category]: prev[category].map((s) =>
        s.id === sliderId ? { ...s, [field]: value } : s
      ),
    }));
  };

  const handleResetToDefaults = () => {
    setContingencyPercent(DEFAULT_CONTINGENCY_PERCENT * 100);
    setSizeFactors(PROJECT_SIZE_RANGES.map((r) => ({ ...r })));
    setFloorFactors({ ...FLOOR_FACTORS });
    setLocationFactors(LOCATIONS.map((l) => ({ ...l })));

    const configs: Record<string, SliderWeightConfig[]> = {};
    Object.entries(INITIAL_SLIDERS).forEach(([category, sliders]) => {
      configs[category] = sliders.map((s) => ({
        id: s.id,
        label: s.label,
        weight: s.weight,
        lowFactor: s.lowFactor,
        highFactor: s.highFactor,
      }));
    });
    setSliderConfigs(configs);
  };

  const categoryLabels: Record<string, string> = {
    construction: "Construction Costs",
    ffeAppliances: "FF&E / Appliances",
    signage: "Signage",
    technology: "Technology",
    designFees: "Design Fees",
    other: "Other Costs",
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-orange-200 bg-orange-50/30">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-orange-50/50 transition-colors">
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center gap-2 text-orange-800">
                <Settings className="h-5 w-5" />
                Admin Settings
                <span className="text-xs font-normal text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                  Internal Only
                </span>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-orange-600 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6 pt-0">
            {/* Unlock Toggle */}
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="text-slate-600">
                  {isUnlocked
                    ? "Editing enabled - changes are local only"
                    : "Unlock to view and edit calculation parameters"}
                </span>
              </div>
              <Button
                variant={isUnlocked ? "destructive" : "outline"}
                size="sm"
                onClick={() => setIsUnlocked(!isUnlocked)}
                className="gap-2"
              >
                {isUnlocked ? (
                  <>
                    <Unlock className="h-4 w-4" />
                    Lock
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Unlock
                  </>
                )}
              </Button>
            </div>

            {isUnlocked && (
              <>
                {/* Reset Button */}
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetToDefaults}
                    className="gap-2 text-slate-600"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset to Defaults
                  </Button>
                </div>

                {/* Contingency Percent */}
                <div className="bg-white rounded-lg border p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Percent className="h-4 w-4 text-orange-500" />
                    Contingency Percentage
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      max="50"
                      value={contingencyPercent}
                      onChange={(e) =>
                        setContingencyPercent(Number(e.target.value))
                      }
                      className="w-24"
                    />
                    <span className="text-sm text-slate-500">%</span>
                    <span className="text-xs text-slate-400">
                      (Default: {DEFAULT_CONTINGENCY_PERCENT * 100}%)
                    </span>
                  </div>
                </div>

                {/* Project Size Factors */}
                <div className="bg-white rounded-lg border p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Scale className="h-4 w-4 text-orange-500" />
                    Project Size Factors
                  </div>
                  <div className="space-y-2">
                    {sizeFactors.map((range, idx) => (
                      <div
                        key={range.label}
                        className="flex items-center gap-3 text-sm"
                      >
                        <span className="w-40 text-slate-600">{range.label}</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.5"
                          max="3"
                          value={range.factor}
                          onChange={(e) => {
                            const newFactors = [...sizeFactors];
                            newFactors[idx].factor = Number(e.target.value);
                            setSizeFactors(newFactors);
                          }}
                          className="w-20"
                        />
                        <span className="text-xs text-slate-400">
                          (Default: {PROJECT_SIZE_RANGES[idx].factor})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floor Factors */}
                <div className="bg-white rounded-lg border p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Building className="h-4 w-4 text-orange-500" />
                    Floor Factors
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.entries(floorFactors).map(([floor, factor]) => (
                      <div key={floor} className="space-y-1">
                        <Label className="text-xs text-slate-500">
                          {floor} Floor{Number(floor) > 1 ? "s" : ""}
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.5"
                          max="3"
                          value={factor}
                          onChange={(e) => {
                            setFloorFactors((prev) => ({
                              ...prev,
                              [floor]: Number(e.target.value),
                            }));
                          }}
                          className="w-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location Factors */}
                <div className="bg-white rounded-lg border p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <MapPin className="h-4 w-4 text-orange-500" />
                    Location Factors
                  </div>
                  <div className="space-y-2">
                    {locationFactors.map((loc, idx) => (
                      <div
                        key={loc.location}
                        className="flex items-center gap-3 text-sm"
                      >
                        <span className="w-32 text-slate-600">{loc.location}</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.5"
                          max="2"
                          value={loc.factor}
                          onChange={(e) => {
                            const newLocs = [...locationFactors];
                            newLocs[idx].factor = Number(e.target.value);
                            setLocationFactors(newLocs);
                          }}
                          className="w-20"
                        />
                        <span className="text-xs text-slate-400">
                          (Default: {LOCATIONS[idx].factor})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Slider Weights by Category */}
                <div className="bg-white rounded-lg border p-4 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Scale className="h-4 w-4 text-orange-500" />
                    Criteria Weights & Factor Ranges
                  </div>

                  {Object.entries(sliderConfigs).map(([category, sliders]) => (
                    <Collapsible key={category}>
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between p-2 bg-slate-50 rounded hover:bg-slate-100 transition-colors">
                          <span className="text-sm font-medium text-slate-700">
                            {categoryLabels[category] || category}
                          </span>
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="mt-2 space-y-3 pl-2">
                          {sliders.map((slider) => (
                            <div
                              key={slider.id}
                              className="grid grid-cols-4 gap-2 items-center text-sm"
                            >
                              <span className="text-slate-600 truncate">
                                {slider.label}
                              </span>
                              <div className="space-y-1">
                                <Label className="text-xs text-slate-400">
                                  Weight
                                </Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max="1"
                                  value={slider.weight}
                                  onChange={(e) =>
                                    handleSliderWeightChange(
                                      category,
                                      slider.id,
                                      "weight",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="w-full h-8 text-xs"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-slate-400">
                                  Low Factor
                                </Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max="3"
                                  value={slider.lowFactor}
                                  onChange={(e) =>
                                    handleSliderWeightChange(
                                      category,
                                      slider.id,
                                      "lowFactor",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="w-full h-8 text-xs"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-slate-400">
                                  High Factor
                                </Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max="3"
                                  value={slider.highFactor}
                                  onChange={(e) =>
                                    handleSliderWeightChange(
                                      category,
                                      slider.id,
                                      "highFactor",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="w-full h-8 text-xs"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>

                {/* Info Notice */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-800">
                    <strong>Note:</strong> Changes made here are for viewing
                    purposes only and are not persisted. To permanently update
                    calculation parameters, modify the constants in{" "}
                    <code className="bg-amber-100 px-1 rounded">
                      calculator-constants.ts
                    </code>
                    .
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
