import React, { useMemo, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { decodeState } from "@/lib/url-state";
import { calculateProjectCosts } from "@/lib/calculator-engine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  Legend
} from "recharts";
import { 
  Building2, 
  MapPin, 
  Ruler, 
  ArrowLeft, 
  Printer, 
  Share2 
} from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];

export default function PresentationPage() {
  const [location, setLocation] = useLocation();
  const search = useSearch();
  
  // Parse state from URL query parameter 'data'
  const state = useMemo(() => {
    const params = new URLSearchParams(search);
    const data = params.get("data");
    if (!data) return null;
    return decodeState(data);
  }, [search]);

  // Redirect if no data
  useEffect(() => {
    if (!state) {
      // Small timeout to allow render, but generally should redirect
      // setLocation("/"); 
    }
  }, [state, setLocation]);

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No project data found.</p>
          <Button onClick={() => setLocation("/")}>Create New Project</Button>
        </div>
      </div>
    );
  }

  const { inputs, sliderValues } = state;
  const results = calculateProjectCosts(inputs, sliderValues);

  // Prepare chart data
  const chartData = results.categories.map(cat => ({
    name: cat.category,
    value: cat.totalCost
  }));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-primary/20">
      {/* Navigation / Actions (Hidden on Print) */}
      <nav className="print:hidden sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center">
        <Button variant="ghost" size="sm" onClick={() => setLocation("/")} className="text-slate-500 hover:text-slate-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Editor
        </Button>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Report
          </Button>
          <Button size="sm" onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
          }}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </nav>

      {/* Report Content */}
      <div className="max-w-5xl mx-auto p-8 md:p-12 lg:p-16 space-y-16 animate-in fade-in duration-700 slide-in-from-bottom-4">
        
        {/* Header Section */}
        <header className="space-y-6 text-center md:text-left border-b border-slate-100 pb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-xs font-medium uppercase tracking-wider text-slate-500 mb-4">
            Preliminary Budget Estimate
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-medium text-slate-900 leading-tight">
            {inputs.projectName || "Untitled Project"}
          </h1>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-6 text-slate-500">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{inputs.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              <span>{inputs.projectSize.toLocaleString()} RSF</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>{inputs.floors} Floor{inputs.floors > 1 ? 's' : ''}</span>
            </div>
          </div>
        </header>

        {/* Executive Summary Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-900 text-white border-none shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Estimated Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl md:text-4xl font-serif">
                ${results.grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="mt-2 text-slate-400 text-sm">
                Includes {(results.contingencyPercent * 100).toFixed(0)}% contingency
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-50 border-slate-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-500 text-sm font-medium uppercase tracking-wider">Cost Per RSF</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl md:text-4xl font-serif text-slate-900">
                ${results.grandTotalPerRSF.toFixed(2)}
              </div>
              <div className="mt-2 text-slate-500 text-sm">
                Based on {inputs.projectSize.toLocaleString()} RSF
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-500 text-sm font-medium uppercase tracking-wider">Project Complexity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                 <div className="text-3xl md:text-4xl font-serif text-slate-900">
                  {results.uniqueProjectFactor.toFixed(2)}x
                </div>
                <div className="mb-1 text-sm font-medium text-slate-400">Factor</div>
              </div>
              <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full" 
                  style={{ width: `${Math.min(100, Math.max(0, ((results.uniqueProjectFactor - 0.5) / 1.0) * 100))}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Visual & Detailed Breakdown */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Chart */}
          <div className="space-y-6">
             <h3 className="text-xl font-serif text-slate-900">Budget Allocation</h3>
             <div className="h-[400px] w-full border border-slate-100 rounded-xl p-4 bg-slate-50/50">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value: number) => `$${value.toLocaleString()}`}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={100} 
                      wrapperStyle={{ paddingTop: '20px' }}
                      layout="horizontal"
                      align="center"
                    />
                  </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="text-sm text-slate-500 leading-relaxed">
               The largest cost driver is <strong>{chartData.sort((a,b) => b.value - a.value)[0].name}</strong>, 
               accounting for {((chartData.sort((a,b) => b.value - a.value)[0].value / results.subtotal) * 100).toFixed(1)}% of the subtotal.
             </div>
          </div>

          {/* Table */}
          <div className="space-y-6">
            <h3 className="text-xl font-serif text-slate-900">Detailed Breakdown</h3>
            <div className="rounded-xl border border-slate-100 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-medium">Category</th>
                    <th className="px-6 py-4 font-medium text-right">$/RSF</th>
                    <th className="px-6 py-4 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.categories.map((cat) => (
                    <tr key={cat.category} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-700">{cat.category}</td>
                      <td className="px-6 py-4 text-right text-slate-500 font-mono">${cat.costPerRSF.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-slate-900 font-mono">${cat.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50/80 font-semibold">
                    <td className="px-6 py-4 text-slate-900">Subtotal</td>
                    <td className="px-6 py-4 text-right font-mono text-slate-900">
                       ${(results.subtotal / inputs.projectSize).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-900">${results.subtotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-between items-center px-6 py-4 bg-slate-50 rounded-xl border border-slate-100">
               <span className="text-slate-500">Contingency ({(results.contingencyPercent * 100)}%)</span>
               <span className="font-mono text-slate-700">${results.contingency.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
          </div>

        </section>
        
        <footer className="pt-12 border-t border-slate-100 text-center text-slate-400 text-sm">
          <p>Generated by Cost Factor Calculator • {new Date().getFullYear()}</p>
        </footer>

      </div>
    </div>
  );
}
