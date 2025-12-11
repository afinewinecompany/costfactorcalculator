import React, { useState, useMemo } from "react";
import { ProjectInputs } from "@/components/calculator/ProjectInputs";
import { SliderGroup } from "@/components/calculator/SliderGroup";
import { CostProjection } from "@/components/calculator/CostProjection";
import { SummaryTable } from "@/components/calculator/SummaryTable";
import { calculateProjectCosts, getInitialSliderValues } from "@/lib/calculator-engine";
import { INITIAL_SLIDERS } from "@/lib/calculator-constants";
import { ProjectInput } from "@/lib/calculator-types";

export default function CalculatorPage() {
  const [inputs, setInputs] = useState<ProjectInput>({
    projectName: "New Project",
    projectSize: 25000,
    floors: 1,
    location: "New York, NY",
  });

  const [sliderValues, setSliderValues] = useState<Record<string, number>>(() => 
    getInitialSliderValues()
  );

  const handleSliderChange = (id: string, value: number) => {
    setSliderValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleReset = () => {
    setSliderValues(getInitialSliderValues());
  };

  const results = useMemo(() => {
    return calculateProjectCosts(inputs, sliderValues);
  }, [inputs, sliderValues]);

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
          </div>
          <div className="text-sm text-muted-foreground hidden md:block">
            Commercial Real Estate Budgeting
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
