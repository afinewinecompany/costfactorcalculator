import React, { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { ProjectInputs } from "@/components/calculator/ProjectInputs";
import { SliderGroup } from "@/components/calculator/SliderGroup";
import { CostProjection } from "@/components/calculator/CostProjection";
import { SummaryTable } from "@/components/calculator/SummaryTable";
import { BaseCostsSettings } from "@/components/calculator/BaseCostsSettings";
import { calculateProjectCosts, getInitialSliderValues } from "@/lib/calculator-engine";
import { INITIAL_SLIDERS, BASE_VALUES_PER_RSF } from "@/lib/calculator-constants";
import { ProjectInput, BaseValues } from "@/lib/calculator-types";
import { encodeState } from "@/lib/url-state";
import { Button } from "@/components/ui/button";
import { Presentation, Settings2 } from "lucide-react";

export default function CalculatorPage() {
  const [location, setLocation] = useLocation();
  
  const [inputs, setInputs] = useState<ProjectInput>({
    projectName: "New Project",
    projectSize: 25000,
    floors: 1,
    location: "New York, NY",
  });

  const [sliderValues, setSliderValues] = useState<Record<string, number>>(() => 
    getInitialSliderValues()
  );

  const [baseValues, setBaseValues] = useState<BaseValues>(BASE_VALUES_PER_RSF);

  const handleSliderChange = (id: string, value: number) => {
    setSliderValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleReset = () => {
    setSliderValues(getInitialSliderValues());
    // Also reset base values? Probably just sliders as "Reset to Defaults" usually implies sliders in this context
    // But let's clarify that reset button in CostProjection specifically resets defaults for sliders
  };

  const results = useMemo(() => {
    return calculateProjectCosts(inputs, sliderValues, baseValues);
  }, [inputs, sliderValues, baseValues]);

  const handlePresent = () => {
    const stateString = encodeState(inputs, sliderValues, baseValues);
    setLocation(`/presentation?data=${stateString}`);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold text-lg">
              $
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Cost Factor Calculator
            </h1>
            <div className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 text-xs font-medium text-slate-500 flex items-center gap-1 border border-slate-200">
              <Settings2 className="h-3 w-3" />
              Editor Mode
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <Button 
               onClick={handlePresent} 
               className="gap-2 shadow-sm transition-all hover:scale-105 active:scale-95 animate-pulse hover:animate-none"
             >
               <Presentation className="h-4 w-4" />
               <span className="hidden sm:inline">Client Presentation</span>
               <span className="inline sm:hidden">Present</span>
             </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs & Sliders */}
          <div className="lg:col-span-8 space-y-8">
            <section>
              <ProjectInputs input={inputs} onChange={setInputs} />
            </section>
            
            <section>
              <BaseCostsSettings values={baseValues} onChange={setBaseValues} />
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground px-1">
                Construction Criteria
              </h2>
              <SliderGroup
                title="Construction Costs"
                sliders={INITIAL_SLIDERS.construction}
                values={sliderValues}
                onValueChange={handleSliderChange}
              />
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground px-1">
                FF&E, Tech & Other
              </h2>
              <SliderGroup
                title="FF&E / Appliances"
                sliders={INITIAL_SLIDERS.ffeAppliances}
                values={sliderValues}
                onValueChange={handleSliderChange}
                defaultOpen={false}
              />
              <SliderGroup
                title="Technology (AV, IT & SEC)"
                sliders={INITIAL_SLIDERS.technology}
                values={sliderValues}
                onValueChange={handleSliderChange}
                defaultOpen={false}
              />
              <SliderGroup
                title="Signage"
                sliders={INITIAL_SLIDERS.signage}
                values={sliderValues}
                onValueChange={handleSliderChange}
                defaultOpen={false}
              />
              <SliderGroup
                title="Design Fees & Permitting"
                sliders={INITIAL_SLIDERS.designFees}
                values={sliderValues}
                onValueChange={handleSliderChange}
                defaultOpen={false}
              />
              <SliderGroup
                title="Other Costs"
                sliders={INITIAL_SLIDERS.other}
                values={sliderValues}
                onValueChange={handleSliderChange}
                defaultOpen={false}
              />
            </section>

            <section>
              <SummaryTable output={results} />
            </section>
          </div>

          {/* Right Column: Sticky Projection */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <CostProjection
                baseRate={results.baseTotalPerRSF}
                adjustedRate={results.grandTotalPerRSF}
                uniqueProjectFactor={results.uniqueProjectFactor}
                totalCost={results.grandTotal}
                onReset={handleReset}
              />
              
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
                <p className="font-semibold mb-1">Note:</p>
                <p>
                  Design fees are dynamically calculated based on construction complexity ({INITIAL_SLIDERS.designFees[0].weight * 100}% weight) and permitting ({INITIAL_SLIDERS.designFees[0].weight * 100}% weight).
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
