import React, { useMemo, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { decodeState } from "@/lib/url-state";
import { calculateProjectCosts } from "@/lib/calculator-engine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { motion, AnimatePresence, Variants } from "framer-motion";

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];

export default function PresentationPage() {
  const [location, setLocation] = useLocation();
  const search = useSearch();
  
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

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No project data found.</p>
          <Button onClick={() => setLocation("/")}>Create New Project</Button>
        </div>
      </div>
    );
  }

  const { inputs, sliderValues, baseValues } = state;
  const results = calculateProjectCosts(inputs, sliderValues, baseValues);

  const chartData = results.categories.map(cat => ({
    name: cat.category,
    value: cat.totalCost
  }));

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
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans selection:bg-primary/20 relative overflow-hidden">
      {/* Blueprint Grid Background Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]" 
        style={{ 
          backgroundImage: 'radial-gradient(#0f172a 1px, transparent 1px)', 
          backgroundSize: '24px 24px' 
        }} 
      />

      {/* Navigation */}
      <nav className="print:hidden sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 py-4 flex justify-between items-center transition-all duration-300">
        <Button variant="ghost" size="sm" onClick={() => setLocation("/")} className="text-slate-500 hover:text-slate-900 hover:bg-slate-100">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Editor
        </Button>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={handlePrint} className="hover:bg-slate-100 hover:text-slate-900 border-slate-200">
            <Printer className="mr-2 h-4 w-4" />
            Print Report
          </Button>
          <Button size="sm" onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
          }} className="shadow-md hover:shadow-lg transition-all duration-300">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </nav>

      <motion.div 
        className="max-w-5xl mx-auto p-4 md:p-12 lg:p-16 space-y-12 md:space-y-16 relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        
        {/* Header Section */}
        <motion.header 
          variants={itemVariants} 
          className="space-y-6 text-center md:text-left border-b border-slate-200 pb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-medium uppercase tracking-wider text-slate-500 mb-4 shadow-sm">
            Preliminary Budget Estimate
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-medium text-slate-900 leading-tight tracking-tight">
            {inputs.projectName || "Untitled Project"}
          </h1>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-6 text-slate-500 font-medium">
            <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
              <MapPin className="h-4 w-4 text-primary/70" />
              <span>{inputs.location}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
              <Ruler className="h-4 w-4 text-primary/70" />
              <span>{inputs.projectSize.toLocaleString()} RSF</span>
            </div>
            <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
              <Building2 className="h-4 w-4 text-primary/70" />
              <span>{inputs.floors} Floor{inputs.floors > 1 ? 's' : ''}</span>
            </div>
          </div>
        </motion.header>

        {/* Executive Summary Cards */}
        <motion.section variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <motion.div variants={itemVariants} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
            <Card className="bg-slate-900 text-white border-none shadow-xl h-full overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 z-0" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
              
              <CardHeader className="pb-2 relative z-10">
                <CardTitle className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Estimated Budget</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium tracking-tight">
                  ${results.grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
            <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow h-full relative overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-slate-500 text-xs font-bold uppercase tracking-widest">Cost Per RSF</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl md:text-4xl font-serif text-slate-900">
                  ${results.grandTotalPerRSF.toFixed(2)}
                </div>
                <div className="mt-2 text-slate-500 text-sm font-medium">
                  Based on {inputs.projectSize.toLocaleString()} RSF
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
            <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow h-full relative overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-slate-500 text-xs font-bold uppercase tracking-widest">Contingency Reserve</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2">
                   <div className="text-3xl md:text-4xl font-serif text-slate-900">
                    ${results.contingency.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="mb-1 text-sm font-medium text-slate-400">Total</div>
                </div>
                <div className="mt-4 text-xs text-slate-500 leading-relaxed font-medium">
                  A { (results.contingencyPercent * 100).toFixed(0) }% safety margin allocated for unforeseen costs and risks.
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </motion.section>

        {/* Visual & Detailed Breakdown */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Chart */}
          <motion.div variants={itemVariants} className="space-y-6">
             <h3 className="text-xl font-serif text-slate-900 font-medium border-l-4 border-primary pl-4">Budget Allocation</h3>
             <div className="h-[450px] w-full border border-slate-200 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-500">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="45%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={4}
                      dataKey="value"
                      animationDuration={1500}
                      animationBegin={500}
                    >
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                          stroke="transparent"
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      cursor={false}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={120} 
                      wrapperStyle={{ paddingTop: '40px', fontSize: '12px', fontFamily: 'Inter' }}
                      layout="horizontal"
                      align="center"
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="text-sm text-slate-600 leading-relaxed bg-white/50 p-4 rounded-lg border border-slate-100">
               The largest cost driver is <strong className="text-slate-900">{chartData.sort((a,b) => b.value - a.value)[0].name}</strong>, 
               accounting for <span className="text-primary font-bold">{((chartData.sort((a,b) => b.value - a.value)[0].value / results.subtotal) * 100).toFixed(1)}%</span> of the subtotal.
             </div>
          </motion.div>

          {/* Table */}
          <motion.div variants={itemVariants} className="space-y-6 w-full overflow-hidden">
            <h3 className="text-xl font-serif text-slate-900 font-medium border-l-4 border-primary pl-4">Detailed Breakdown</h3>
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4 text-right">$/RSF</th>
                      <th className="px-6 py-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {results.categories.map((cat, i) => (
                      <motion.tr 
                        key={cat.category} 
                        className="hover:bg-slate-50 transition-colors group"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + (i * 0.1) }}
                      >
                        <td className="px-6 py-4 font-medium text-slate-700 group-hover:text-primary transition-colors">{cat.category}</td>
                        <td className="px-6 py-4 text-right text-slate-500 font-mono tracking-tight">${cat.costPerRSF.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right text-slate-900 font-mono font-medium tracking-tight">${cat.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      </motion.tr>
                    ))}
                    <tr className="bg-slate-50/50 font-bold border-t-2 border-slate-100">
                      <td className="px-6 py-4 text-slate-900 text-base">Subtotal</td>
                      <td className="px-6 py-4 text-right font-mono text-slate-900 text-base">
                         ${(results.subtotal / inputs.projectSize).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-slate-900 text-base">${results.subtotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-center px-6 py-5 bg-white rounded-xl border border-slate-200 shadow-sm gap-2 md:gap-0 hover:border-primary/20 transition-colors">
               <span className="text-slate-500 font-medium">Contingency ({(results.contingencyPercent * 100)}%)</span>
               <span className="font-mono text-lg font-bold text-slate-700">${results.contingency.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
          </motion.div>

        </section>
        
        <footer className="pt-12 border-t border-slate-200 text-center text-slate-400 text-sm font-medium">
          <p>Generated by Cost Factor Calculator • {new Date().getFullYear()}</p>
        </footer>

      </motion.div>
    </div>
  );
}
