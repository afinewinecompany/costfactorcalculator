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
import { Settings, Save, Loader2 } from "lucide-react";
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
  onSave?: () => void | Promise<void>;
  isSaving?: boolean;
  isEditing?: boolean;
}

export function ProjectSettingsModal({
  open,
  onOpenChange,
  inputs,
  baseValues,
  onInputsChange,
  onBaseValuesChange,
  onSave,
  isSaving = false,
  isEditing = false,
}: ProjectSettingsModalProps) {
  const handleSave = async () => {
    if (onSave) {
      await onSave();
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {isEditing ? "Edit Project Settings" : "New Project Settings"}
          </DialogTitle>
          <DialogDescription>
            Configure project details and base cost assumptions. These settings are not visible to clients.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <ProjectInputs input={inputs} onChange={onInputsChange} />
          <BaseCostsSettings values={baseValues} onChange={onBaseValuesChange} />
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          {onSave && (
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? "Update Project" : "Create Project"}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
