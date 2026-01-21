import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectInput } from "@/lib/calculator-types";
import { LOCATIONS } from "@/lib/calculator-constants";
import { Building, DollarSign, MapPin, Ruler } from "lucide-react";

interface ProjectInputsProps {
  input: ProjectInput;
  onChange: (input: ProjectInput) => void;
}

export function ProjectInputs({ input, onChange }: ProjectInputsProps) {
  const handleChange = (field: keyof ProjectInput, value: any) => {
    onChange({ ...input, [field]: value });
  };

  return (
    <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
          <Building className="h-5 w-5 text-primary" />
          Project Details
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="projectName">Project Name</Label>
          <Input
            id="projectName"
            placeholder="e.g. HQ Relocation"
            value={input.projectName}
            onChange={(e) => handleChange("projectName", e.target.value)}
            className="bg-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="projectSize">Project Size (RSF)</Label>
          <div className="relative">
            <Ruler className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="projectSize"
              type="number"
              placeholder="0"
              value={input.projectSize || ""}
              onChange={(e) => handleChange("projectSize", Number(e.target.value))}
              className="pl-9 bg-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="floors">Number of Floors</Label>
          <Select
            value={String(input.floors)}
            onValueChange={(val) => handleChange("floors", Number(val))}
          >
            <SelectTrigger id="floors" className="bg-white">
              <SelectValue placeholder="Select floors" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <SelectItem key={num} value={String(num)}>
                  {num} {num === 1 ? "Floor" : "Floors"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Select
            value={input.location}
            onValueChange={(val) => handleChange("location", val)}
          >
            <SelectTrigger id="location" className="bg-white">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Select location" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {LOCATIONS.map((loc) => (
                <SelectItem key={loc.location} value={loc.location}>
                  {loc.location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="tiAllowance">TI Allowance ($/SF)</Label>
          <p className="text-xs text-muted-foreground">
            Tenant Improvement allowance from building owner that reduces the client's total cost
          </p>
          <div className="relative max-w-xs">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="tiAllowance"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={input.tiAllowancePerSF ?? ""}
              onChange={(e) => handleChange("tiAllowancePerSF", e.target.value ? Number(e.target.value) : undefined)}
              className="pl-9 bg-white"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
