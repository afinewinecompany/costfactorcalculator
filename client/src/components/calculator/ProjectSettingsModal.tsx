import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Settings, Save, Loader2, FileText } from "lucide-react";
import { ProjectInputs } from "./ProjectInputs";
import { BaseCostsSettings } from "./BaseCostsSettings";
import { EstimateEditor } from "./EstimateEditor";
import { ProjectInput, BaseValues } from "@/lib/calculator-types";
import type { SavedEstimate } from "@shared/schema";

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
  estimates?: SavedEstimate[];
  onEstimateUpdated?: () => void;
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
  estimates,
  onEstimateUpdated,
}: ProjectSettingsModalProps) {
  const handleSave = async () => {
    if (onSave) {
      await onSave();
    } else {
      onOpenChange(false);
    }
  };

  const hasEstimates = isEditing && estimates && estimates.length > 0;

  const settingsContent = (
    <div className="space-y-6 py-4">
      <ProjectInputs input={inputs} onChange={onInputsChange} />
      <BaseCostsSettings values={baseValues} onChange={onBaseValuesChange} />
    </div>
  );

  const footer = (
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
  );

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

        {hasEstimates ? (
          <Tabs defaultValue="settings" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="settings" className="gap-1.5">
                <Settings className="h-3.5 w-3.5" />
                Project Settings
              </TabsTrigger>
              <TabsTrigger value="estimates" className="gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Estimates ({estimates!.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="settings" className="mt-4">
              {settingsContent}
              {footer}
            </TabsContent>
            <TabsContent value="estimates" className="mt-4">
              <EstimateEditor
                estimates={estimates!}
                onEstimateUpdated={onEstimateUpdated || (() => {})}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <>
            {settingsContent}
            {footer}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
