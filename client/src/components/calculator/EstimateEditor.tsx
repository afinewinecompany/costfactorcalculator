import React, { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Save,
  Loader2,
  FileText,
  AlertCircle,
  DollarSign,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { calculateProjectCosts } from "@/lib/calculator-engine";
import type { ProjectInput, BaseValues } from "@/lib/calculator-types";
import type { SavedEstimate } from "@shared/schema";

interface EstimateEditorProps {
  estimates: SavedEstimate[];
  onEstimateUpdated: () => void;
}

interface EditFormState {
  name: string;
  description: string;
  projectSize: number;
  floors: number;
  tiAllowancePerSF: number;
}

function getFormFromEstimate(estimate: SavedEstimate): EditFormState {
  const inputs = estimate.inputs as ProjectInput;
  return {
    name: estimate.name,
    description: estimate.description || "",
    projectSize: inputs.projectSize,
    floors: inputs.floors,
    tiAllowancePerSF: inputs.tiAllowancePerSF ?? 0,
  };
}

function hasNumericChanges(form: EditFormState, estimate: SavedEstimate): boolean {
  const inputs = estimate.inputs as ProjectInput;
  return (
    form.projectSize !== inputs.projectSize ||
    form.floors !== inputs.floors ||
    form.tiAllowancePerSF !== (inputs.tiAllowancePerSF ?? 0)
  );
}

function hasAnyChanges(form: EditFormState, estimate: SavedEstimate): boolean {
  const inputs = estimate.inputs as ProjectInput;
  return (
    form.name !== estimate.name ||
    form.description !== (estimate.description || "") ||
    form.projectSize !== inputs.projectSize ||
    form.floors !== inputs.floors ||
    form.tiAllowancePerSF !== (inputs.tiAllowancePerSF ?? 0)
  );
}

export function EstimateEditor({ estimates, onEstimateUpdated }: EstimateEditorProps) {
  const { toast } = useToast();
  const [editForms, setEditForms] = useState<Record<string, EditFormState>>({});
  const [expandedItem, setExpandedItem] = useState<string>("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const getOrInitForm = useCallback(
    (estimate: SavedEstimate): EditFormState => {
      return editForms[estimate.id] || getFormFromEstimate(estimate);
    },
    [editForms]
  );

  const updateForm = (estimateId: string, updates: Partial<EditFormState>) => {
    setEditForms((prev) => ({
      ...prev,
      [estimateId]: {
        ...(prev[estimateId] || getFormFromEstimate(estimates.find((e) => e.id === estimateId)!)),
        ...updates,
      },
    }));
  };

  const resetForm = (estimateId: string) => {
    setEditForms((prev) => {
      const next = { ...prev };
      delete next[estimateId];
      return next;
    });
  };

  const updateEstimateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) => {
      const res = await fetch(`/api/estimates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update estimate");
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      resetForm(variables.id);
      onEstimateUpdated();
      toast({
        title: "Estimate updated",
        description: "Changes have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteEstimateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/estimates/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete estimate");
      }
      return res.json();
    },
    onSuccess: () => {
      setDeleteConfirmId(null);
      setExpandedItem("");
      onEstimateUpdated();
      toast({
        title: "Estimate deleted",
        description: "The estimate has been removed.",
      });
    },
    onError: (error: Error) => {
      setDeleteConfirmId(null);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = (estimate: SavedEstimate) => {
    const form = getOrInitForm(estimate);
    const inputs = estimate.inputs as ProjectInput;
    const numericChanged = hasNumericChanges(form, estimate);

    const payload: Record<string, unknown> = {};

    if (form.name !== estimate.name) {
      payload.name = form.name;
    }
    if (form.description !== (estimate.description || "")) {
      payload.description = form.description || null;
    }

    if (numericChanged) {
      const updatedInputs: ProjectInput = {
        ...inputs,
        projectSize: form.projectSize,
        floors: form.floors,
        tiAllowancePerSF: form.tiAllowancePerSF,
      };
      const computed = calculateProjectCosts(
        updatedInputs,
        estimate.sliderValues as Record<string, number>,
        estimate.baseValues as BaseValues
      );
      payload.inputs = updatedInputs;
      payload.computedOutput = computed;
      payload.grandTotal = computed.grandTotal.toFixed(2);
      payload.grandTotalPerRSF = computed.grandTotalPerRSF.toFixed(2);
      payload.clientTotal = computed.clientTotal.toFixed(2);
      payload.clientTotalPerRSF = computed.clientTotalPerRSF.toFixed(2);
      payload.projectSize = form.projectSize;
    }

    updateEstimateMutation.mutate({ id: estimate.id, payload });
  };

  const handleAccordionChange = (value: string) => {
    // Reset form for previously expanded item
    if (expandedItem && expandedItem !== value) {
      resetForm(expandedItem);
    }
    setExpandedItem(value);
  };

  if (estimates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">
          No estimates saved yet. Use the Client View to create and save estimates.
        </p>
      </div>
    );
  }

  const sortedEstimates = [...estimates].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground mb-3">
        Edit individual estimate details below. Changing sq footage, floors, or TI allowance will recalculate costs.
      </p>
      <Accordion
        type="single"
        collapsible
        value={expandedItem}
        onValueChange={handleAccordionChange}
      >
        {sortedEstimates.map((estimate) => {
          const form = getOrInitForm(estimate);
          const changed = hasAnyChanges(form, estimate);
          const numericChanged = hasNumericChanges(form, estimate);
          const isSaving = updateEstimateMutation.isPending &&
            updateEstimateMutation.variables?.id === estimate.id;

          return (
            <AccordionItem key={estimate.id} value={estimate.id}>
              <AccordionTrigger className="hover:no-underline px-1">
                <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
                  <div className="min-w-0 flex-1 text-left">
                    <span className="font-medium text-slate-900 truncate block text-sm">
                      {estimate.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(estimate.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="outline" className="text-xs gap-1">
                      <DollarSign className="h-3 w-3" />
                      {Number(estimate.grandTotal).toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {estimate.projectSize?.toLocaleString()} RSF
                    </Badge>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-1">
                <div className="space-y-4 pt-2">
                  {/* Estimate Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor={`name-${estimate.id}`} className="text-xs font-medium">
                      Estimate Name
                    </Label>
                    <Input
                      id={`name-${estimate.id}`}
                      value={form.name}
                      onChange={(e) => updateForm(estimate.id, { name: e.target.value })}
                      placeholder="Estimate name"
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5">
                    <Label htmlFor={`desc-${estimate.id}`} className="text-xs font-medium">
                      Notes
                    </Label>
                    <Textarea
                      id={`desc-${estimate.id}`}
                      value={form.description}
                      onChange={(e) => updateForm(estimate.id, { description: e.target.value })}
                      placeholder="Add notes about this estimate..."
                      rows={2}
                    />
                  </div>

                  {/* Numeric fields in a grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor={`sqft-${estimate.id}`} className="text-xs font-medium">
                        Sq Footage (RSF)
                      </Label>
                      <Input
                        id={`sqft-${estimate.id}`}
                        type="number"
                        min={1}
                        value={form.projectSize}
                        onChange={(e) =>
                          updateForm(estimate.id, {
                            projectSize: Math.max(1, parseInt(e.target.value) || 1),
                          })
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor={`floors-${estimate.id}`} className="text-xs font-medium">
                        Floors
                      </Label>
                      <Select
                        value={String(form.floors)}
                        onValueChange={(val) =>
                          updateForm(estimate.id, { floors: parseInt(val) })
                        }
                      >
                        <SelectTrigger id={`floors-${estimate.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                            <SelectItem key={n} value={String(n)}>
                              {n} {n === 1 ? "Floor" : "Floors"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor={`ti-${estimate.id}`} className="text-xs font-medium">
                        TI Allowance ($/SF)
                      </Label>
                      <Input
                        id={`ti-${estimate.id}`}
                        type="number"
                        min={0}
                        step={0.01}
                        value={form.tiAllowancePerSF}
                        onChange={(e) =>
                          updateForm(estimate.id, {
                            tiAllowancePerSF: Math.max(0, parseFloat(e.target.value) || 0),
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Recalculation notice */}
                  {numericChanged && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs">
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                      Totals will be recalculated when you save.
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      size="sm"
                      onClick={() => handleSave(estimate)}
                      disabled={!changed || isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-3.5 w-3.5 mr-1.5" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        resetForm(estimate.id);
                        setExpandedItem("");
                      }}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <div className="flex-1" />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteConfirmId(estimate.id)}
                      disabled={isSaving}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Estimate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this estimate? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteConfirmId && deleteEstimateMutation.mutate(deleteConfirmId)}
              disabled={deleteEstimateMutation.isPending}
            >
              {deleteEstimateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
