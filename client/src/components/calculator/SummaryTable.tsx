import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectOutput } from "@/lib/calculator-types";
import { FileText } from "lucide-react";

interface SummaryTableProps {
  output: ProjectOutput;
}

export function SummaryTable({ output }: SummaryTableProps) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Detailed Cost Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Category</TableHead>
              <TableHead className="text-right">Factor</TableHead>
              <TableHead className="text-right">$/RSF</TableHead>
              <TableHead className="text-right">Total Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {output.categories.map((cat) => (
              <TableRow key={cat.category}>
                <TableCell className="font-medium">{cat.category}</TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  {cat.adjustedFactor.toFixed(3)}x
                </TableCell>
                <TableCell className="text-right font-mono">
                  ${cat.costPerRSF.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-mono font-medium">
                  ${cat.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </TableCell>
              </TableRow>
            ))}
            
            <TableRow className="bg-muted/20">
              <TableCell colSpan={2} className="font-bold text-base">Subtotal</TableCell>
              <TableCell className="text-right font-bold font-mono">
                ${(output.subtotal / (output.grandTotal / output.grandTotalPerRSF || 1)).toFixed(2)}
              </TableCell>
              <TableCell className="text-right font-bold font-mono text-base">
                ${output.subtotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell colSpan={2} className="text-muted-foreground">
                Contingency ({(output.contingencyPercent * 100).toFixed(0)}%)
              </TableCell>
              <TableCell className="text-right font-mono text-muted-foreground">
                ${(output.contingency / (output.grandTotal / output.grandTotalPerRSF || 1)).toFixed(2)}
              </TableCell>
              <TableCell className="text-right font-mono text-muted-foreground">
                ${output.contingency.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </TableCell>
            </TableRow>

            <TableRow className="bg-muted/10">
              <TableCell colSpan={2} className="font-semibold">Grand Total</TableCell>
              <TableCell className="text-right font-mono font-semibold">
                ${output.grandTotalPerRSF.toFixed(2)}
              </TableCell>
              <TableCell className="text-right font-mono font-semibold">
                ${output.grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </TableCell>
            </TableRow>

            {output.tiAllowanceTotal > 0 && (
              <TableRow className="bg-emerald-50">
                <TableCell colSpan={2} className="text-emerald-700 font-medium">
                  TI Allowance (${output.tiAllowancePerSF.toFixed(2)}/SF)
                </TableCell>
                <TableCell className="text-right font-mono text-emerald-600">
                  -${output.tiAllowancePerSF.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-mono text-emerald-600 font-medium">
                  -${output.tiAllowanceTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </TableCell>
              </TableRow>
            )}

          </TableBody>
          <TableFooter className="bg-primary/5">
            <TableRow>
              <TableCell colSpan={2} className="text-lg font-bold text-primary">
                {output.tiAllowanceTotal > 0 ? 'Client Investment' : 'Grand Total'}
              </TableCell>
              <TableCell className="text-right text-lg font-bold font-mono text-primary">
                ${(output.tiAllowanceTotal > 0 ? output.clientTotalPerRSF : output.grandTotalPerRSF).toFixed(2)}
              </TableCell>
              <TableCell className="text-right text-lg font-bold font-mono text-primary">
                ${(output.tiAllowanceTotal > 0 ? output.clientTotal : output.grandTotal).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
