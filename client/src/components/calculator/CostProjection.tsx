import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RotateCcw, Calculator, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface CostProjectionProps {
  baseRate: number;
  adjustedRate: number;
  uniqueProjectFactor: number;
  totalCost: number;
  onReset: () => void;
  className?: string;
}

export function CostProjection({ 
  baseRate, 
  adjustedRate, 
  uniqueProjectFactor, 
  totalCost,
  onReset,
  className
}: CostProjectionProps) {
  
  // Calculate relative factor for progress bar (center at 1.0)
  // Let's say range is 0.5 to 1.5 for visualization
  const factorProgress = Math.max(0, Math.min(100, ((uniqueProjectFactor - 0.5) / 1.0) * 100));

  // Rate difference
  const rateDiff = adjustedRate - baseRate;
  const isPositive = rateDiff > 0;

  return (
    <Card className={cn("border-l-4 border-l-primary shadow-lg overflow-hidden", className)}>
      <CardHeader className="bg-muted/30 pb-4">
        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Cost Projection
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        
        {/* Base Rate */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Base Value</span>
          <span className="font-mono font-medium">${baseRate.toFixed(2)}/RSF</span>
        </div>

        <Separator />

        {/* Unique Project Factor */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-foreground">Unique Factor</span>
            <span className="font-mono text-lg font-bold text-primary">
              {uniqueProjectFactor.toFixed(3)}x
            </span>
          </div>
          <Progress value={factorProgress} className="h-2" />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>0.5x</span>
            <span>1.0x</span>
            <span>1.5x</span>
          </div>
        </div>

        <Separator />

        {/* Adjusted Rate */}
        <div className="space-y-1">
          <div className="flex justify-between items-baseline">
             <span className="text-sm font-medium">Adjusted Rate</span>
             <span className={cn(
               "font-mono text-2xl font-bold",
               isPositive ? "text-emerald-600" : "text-amber-600"
             )}>
               ${adjustedRate.toFixed(2)}
               <span className="text-sm text-muted-foreground font-normal ml-1">/RSF</span>
             </span>
          </div>
          {rateDiff !== 0 && (
            <div className="text-right text-xs text-muted-foreground">
              {isPositive ? "+" : ""}{rateDiff.toFixed(2)} from base
            </div>
          )}
        </div>

        {/* Total Cost Preview (Big Number) */}
        <div className="bg-primary/5 rounded-lg p-4 text-center border border-primary/10">
           <div className="text-xs uppercase text-muted-foreground font-semibold mb-1">
             Est. Grand Total
           </div>
           <div className="font-mono text-2xl md:text-3xl font-bold text-primary tracking-tight">
             ${totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
           </div>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-muted-foreground hover:text-foreground"
          onClick={onReset}
        >
          <RotateCcw className="mr-2 h-3.5 w-3.5" />
          Reset to Defaults
        </Button>

      </CardContent>
    </Card>
  );
}
