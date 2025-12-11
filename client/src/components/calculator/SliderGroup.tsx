import React from "react";
import { Slider } from "@/components/ui/slider";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { SliderConfig } from "@/lib/calculator-types";
import { sliderToFactor } from "@/lib/calculator-engine";
import { cn } from "@/lib/utils";

// Make strict requirements only on what we use
type DisplaySliderConfig = Pick<SliderConfig, "id" | "label" | "weight" | "lowFactor" | "highFactor">;

interface SliderGroupProps {
  title: string;
  sliders: DisplaySliderConfig[];
  values: Record<string, number>;
  onValueChange: (id: string, value: number) => void;
  defaultOpen?: boolean;
}

export function SliderGroup({ title, sliders, values, onValueChange, defaultOpen = true }: SliderGroupProps) {
  return (
    <Accordion type="single" collapsible defaultValue={defaultOpen ? title : undefined} className="w-full bg-card border rounded-lg shadow-sm">
      <AccordionItem value={title} className="border-b-0">
        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg text-foreground">{title}</span>
            <Badge variant="secondary" className="text-xs font-normal text-muted-foreground">
              {sliders.length} Factors
            </Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-6 pt-2 space-y-8">
          {sliders.map((slider) => {
            const currentValue = values[slider.id] ?? 50; // Default 50 if missing
            const currentFactor = sliderToFactor(currentValue, slider.lowFactor, slider.highFactor);
            
            return (
              <div key={slider.id} className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {slider.label}
                    </label>
                    <div className="text-xs text-muted-foreground">
                      Weight: {(slider.weight * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-medium text-primary">
                      {currentFactor.toFixed(3)}x
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Slider
                    value={[currentValue]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(vals) => onValueChange(slider.id, vals[0])}
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-1">
                    <span>Low ({slider.lowFactor.toFixed(2)})</span>
                    <span>High ({slider.highFactor.toFixed(2)})</span>
                  </div>
                </div>
              </div>
            );
          })}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
