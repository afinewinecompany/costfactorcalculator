import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { ProjectInputs } from "./ProjectInputs";
import { BaseCostsSettings } from "./BaseCostsSettings";
import { ProjectInput, BaseValues } from "@/lib/calculator-types";

interface ProjectSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inputs: ProjectInput;
  baseValues: BaseValues;
  onInputsChange: (inputs: ProjectInput) => void;
  onBaseValuesChange: (values: BaseValues) => void;
}

export function ProjectSettingsModal({
  open,
  onOpenChange,
  inputs,
  baseValues,
  onInputsChange,
  onBaseValuesChange,
}: ProjectSettingsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Project Settings
          </DialogTitle>
          <DialogDescription>
            Configure project details and base cost assumptions. These settings are not visible to clients.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <ProjectInputs input={inputs} onChange={onInputsChange} />
          <BaseCostsSettings values={baseValues} onChange={onBaseValuesChange} />
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
