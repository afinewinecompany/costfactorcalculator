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
import { getQualityLabel, getQualityColorClass } from "@/lib/quality-labels";

// Make strict requirements only on what we use
type DisplaySliderConfig = Pick<SliderConfig, "id" | "label" | "weight" | "lowFactor" | "highFactor">;

interface SliderGroupProps {
  title: string;
  sliders: DisplaySliderConfig[];
  values: Record<string, number>;
  onValueChange: (id: string, value: number) => void;
  defaultOpen?: boolean;
  clientMode?: boolean;
}

export function SliderGroup({ title, sliders, values, onValueChange, defaultOpen = true, clientMode = false }: SliderGroupProps) {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpen ? title : undefined}
      className={cn(
        "w-full border rounded-xl shadow-sm overflow-hidden transition-all duration-300",
        clientMode
          ? "bg-white/80 backdrop-blur-sm border-slate-200/60 hover:border-[#2F739E]/20 hover:shadow-md"
          : "bg-card border-border"
      )}
    >
      <AccordionItem value={title} className="border-b-0">
        <AccordionTrigger className={cn(
          "px-6 py-5 hover:no-underline transition-all duration-300",
          clientMode
            ? "hover:bg-[#2F739E]/5 data-[state=open]:bg-[#2F739E]/5"
            : "hover:bg-muted/50"
        )}>
          <div className="flex items-center gap-3">
            <span className={cn(
              "font-semibold text-lg",
              clientMode ? "text-slate-800" : "text-foreground"
            )}>
              {title}
            </span>
            <Badge
              variant="secondary"
              className={cn(
                "text-xs font-medium",
                clientMode
                  ? "bg-[#2F739E]/10 text-[#2F739E] border-none"
                  : "text-muted-foreground"
              )}
            >
              {sliders.length} Factors
            </Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-8 pt-4 space-y-8">
          {sliders.map((slider, index) => {
            const currentValue = values[slider.id] ?? 50;
            const currentFactor = sliderToFactor(currentValue, slider.lowFactor, slider.highFactor);
            const qualityLabel = getQualityLabel(currentValue);

            return (
              <div
                key={slider.id}
                className={cn(
                  "space-y-4 transition-all duration-300",
                  clientMode && "p-4 -mx-4 rounded-xl hover:bg-slate-50/50"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex justify-between items-center">
                  <div className="space-y-1.5">
                    <label className={cn(
                      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                      clientMode && "text-slate-700"
                    )}>
                      {slider.label}
                    </label>
                    {clientMode ? (
                      <Badge className={cn(
                        "text-xs font-medium transition-all duration-300",
                        qualityLabel === "Basic" && "bg-slate-100 text-slate-600 border-slate-200",
                        qualityLabel === "Standard" && "bg-blue-50 text-blue-700 border-blue-200",
                        qualityLabel === "Enhanced" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                        qualityLabel === "Premium" && "bg-amber-50 text-amber-700 border-amber-200",
                        qualityLabel === "Luxury" && "bg-purple-50 text-purple-700 border-purple-200"
                      )}>
                        {qualityLabel}
                      </Badge>
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        Weight: {(slider.weight * 100).toFixed(1)}%
                      </div>
                    )}
                  </div>
                  {!clientMode && (
                    <div className="text-right">
                      <div className="font-mono text-sm font-medium text-primary">
                        {currentFactor.toFixed(3)}x
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Slider
                    value={[currentValue]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(vals) => onValueChange(slider.id, vals[0])}
                    className="cursor-pointer"
                  />
                  {clientMode ? (
                    <div className="flex justify-between text-xs text-slate-400 font-medium px-0.5">
                      <span>Basic</span>
                      <span>Luxury</span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-1">
                      <span>Low ({slider.lowFactor.toFixed(2)})</span>
                      <span>High ({slider.highFactor.toFixed(2)})</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
