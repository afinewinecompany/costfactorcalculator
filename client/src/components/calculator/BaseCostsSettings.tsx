import React, { useState } from "react";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BaseValues } from "@/lib/calculator-types";
import { Settings, BarChart3 } from "lucide-react";
import { BASE_COST_SCENARIOS } from "@/lib/calculator-constants";

interface BaseCostsSettingsProps {
  values: BaseValues;
  onChange: (values: BaseValues) => void;
}

export function BaseCostsSettings({ values, onChange }: BaseCostsSettingsProps) {
  const [selectedScenario, setSelectedScenario] = useState<string>("MEDIUM");

  const handleScenarioChange = (scenario: string) => {
    setSelectedScenario(scenario);
    // @ts-ignore
    const preset = BASE_COST_SCENARIOS[scenario];
    if (preset) {
      onChange(preset);
    }
  };

  const handleChange = (path: string, val: number) => {
    setSelectedScenario("CUSTOM");
    const newValues = { ...values };
    
    if (path.includes('.')) {
      const [parent, child] = path.split('.');
      // @ts-ignore
      newValues[parent] = { ...newValues[parent], [child]: val };
    } else {
      // @ts-ignore
      newValues[path] = val;
    }
    
    onChange(newValues);
  };

  // Helper to check if current values match a scenario (for UI consistency if props change externally)
  // But for now, local state is fine.

  return (
    <Accordion type="single" collapsible className="w-full bg-white/50 border rounded-lg shadow-sm">
      <AccordionItem value="base-costs" className="border-b-0">
        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Settings className="h-4 w-4" />
            <span className="font-medium text-sm">Configure Base Cost Assumptions ($/RSF)</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-6 pt-2 space-y-6">
          
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
             <Label className="mb-2 block text-sm font-medium text-slate-700">Select Market Tier</Label>
             <div className="flex gap-4 items-center">
                <Select value={selectedScenario} onValueChange={handleScenarioChange}>
                  <SelectTrigger className="w-full md:w-[250px] bg-white">
                    <SelectValue placeholder="Select a tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low Tier Market</SelectItem>
                    <SelectItem value="MEDIUM">Medium Tier Market (Default)</SelectItem>
                    <SelectItem value="HIGH">High Tier Market</SelectItem>
                    <SelectItem value="CUSTOM">Custom Values</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-xs text-muted-foreground hidden md:block">
                  {selectedScenario === "LOW" && "Optimized for budget-conscious projects (~$270/RSF base)"}
                  {selectedScenario === "MEDIUM" && "Standard market rates (~$350/RSF base)"}
                  {selectedScenario === "HIGH" && "Premium specifications (~$410/RSF base)"}
                  {selectedScenario === "CUSTOM" && "Manually adjusted rates"}
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 opacity-90">
            
            <div className="space-y-2">
              <Label htmlFor="constructionCosts" className="text-xs text-muted-foreground uppercase tracking-wider">Construction</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">$</span>
                <Input 
                  id="constructionCosts"
                  type="number" 
                  step="0.01"
                  className="pl-7"
                  value={values.constructionCosts}
                  onChange={(e) => handleChange("constructionCosts", Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="designFees" className="text-xs text-muted-foreground uppercase tracking-wider">Design Fees</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">$</span>
                <Input 
                  id="designFees"
                  type="number" 
                  step="0.01"
                  className="pl-7"
                  value={values.designFees}
                  onChange={(e) => handleChange("designFees", Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ffeAppliances" className="text-xs text-muted-foreground uppercase tracking-wider">FF&E / Appliances</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">$</span>
                <Input 
                  id="ffeAppliances"
                  type="number" 
                  step="0.01"
                  className="pl-7"
                  value={values.ffeAppliances}
                  onChange={(e) => handleChange("ffeAppliances", Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tech-av" className="text-xs text-muted-foreground uppercase tracking-wider">Tech: AV</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">$</span>
                <Input 
                  id="tech-av"
                  type="number" 
                  step="0.01"
                  className="pl-7"
                  value={values.technology.av}
                  onChange={(e) => handleChange("technology.av", Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tech-it" className="text-xs text-muted-foreground uppercase tracking-wider">Tech: IT</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">$</span>
                <Input 
                  id="tech-it"
                  type="number" 
                  step="0.01"
                  className="pl-7"
                  value={values.technology.it}
                  onChange={(e) => handleChange("technology.it", Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tech-sec" className="text-xs text-muted-foreground uppercase tracking-wider">Tech: Security</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">$</span>
                <Input 
                  id="tech-sec"
                  type="number" 
                  step="0.01"
                  className="pl-7"
                  value={values.technology.sec}
                  onChange={(e) => handleChange("technology.sec", Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signage" className="text-xs text-muted-foreground uppercase tracking-wider">Signage</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">$</span>
                <Input 
                  id="signage"
                  type="number" 
                  step="0.01"
                  className="pl-7"
                  value={values.signage}
                  onChange={(e) => handleChange("signage", Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="other" className="text-xs text-muted-foreground uppercase tracking-wider">Other / Moving</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">$</span>
                <Input 
                  id="other"
                  type="number" 
                  step="0.01"
                  className="pl-7"
                  value={values.other}
                  onChange={(e) => handleChange("other", Number(e.target.value))}
                />
              </div>
            </div>

          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
