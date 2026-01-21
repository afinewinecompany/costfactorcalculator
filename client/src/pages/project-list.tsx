import React, { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProjectSettingsModal } from "@/components/calculator/ProjectSettingsModal";
import { ProjectInput, BaseValues } from "@/lib/calculator-types";
import { BASE_VALUES_PER_RSF } from "@/lib/calculator-constants";
import { getInitialSliderValues } from "@/lib/calculator-engine";
import { encodeState } from "@/lib/url-state";
import {
  Plus,
  Settings,
  Presentation,
  MapPin,
  Ruler,
  Building2,
} from "lucide-react";

interface ProjectData {
  inputs: ProjectInput;
  sliderValues: Record<string, number>;
  baseValues: BaseValues;
}

export default function ProjectListPage() {
  const [, setLocation] = useLocation();

  // Single project state (future: multiple projects with persistence)
  const [project, setProject] = useState<ProjectData>(() => ({
    inputs: {
      projectName: "New Project",
      projectSize: 25000,
      floors: 1,
      location: "New York, NY",
    },
    sliderValues: getInitialSliderValues(),
    baseValues: BASE_VALUES_PER_RSF,
  }));

  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const handleOpenSettings = () => {
    setSettingsModalOpen(true);
  };

  const handleOpenClientView = () => {
    const stateString = encodeState(project.inputs, project.sliderValues, project.baseValues);
    setLocation(`/presentation?data=${stateString}`);
  };

  const handleInputsChange = (inputs: ProjectInput) => {
    setProject((prev) => ({ ...prev, inputs }));
  };

  const handleBaseValuesChange = (baseValues: BaseValues) => {
    setProject((prev) => ({ ...prev, baseValues }));
  };

  const handleCreateNew = () => {
    setProject({
      inputs: {
        projectName: "New Project",
        projectSize: 25000,
        floors: 1,
        location: "New York, NY",
      },
      sliderValues: getInitialSliderValues(),
      baseValues: BASE_VALUES_PER_RSF,
    });
    setSettingsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
              <img
                src="/Connected_Logo.png"
                alt="Connected Logo"
                className="h-7 md:h-9 w-auto flex-shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-base md:text-xl font-bold tracking-tight text-slate-900 truncate">
                  Budget Breakdown
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Project Management</p>
              </div>
            </div>

            <Button onClick={handleCreateNew} className="gap-1.5 md:gap-2 shadow-sm flex-shrink-0" size="sm">
              <Plus className="h-4 w-4" />
              <span className="hidden xs:inline">New Project</span>
              <span className="xs:hidden">New</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-serif font-medium text-slate-900">Your Projects</h2>
          <p className="text-muted-foreground mt-1">
            Manage your cost estimation projects and share interactive views with clients.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Project Card */}
          <Card className="hover:shadow-lg transition-all duration-300 border-slate-200 overflow-hidden group">
            <CardHeader className="pb-3 bg-gradient-to-br from-slate-50 to-white">
              <CardTitle className="flex items-center justify-between">
                <span className="truncate text-lg font-semibold text-slate-900">
                  {project.inputs.projectName || "Untitled Project"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md">
                  <MapPin className="h-3.5 w-3.5" />
                  {project.inputs.location}
                </span>
                <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md">
                  <Ruler className="h-3.5 w-3.5" />
                  {project.inputs.projectSize.toLocaleString()} RSF
                </span>
                <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md">
                  <Building2 className="h-3.5 w-3.5" />
                  {project.inputs.floors} Floor{project.inputs.floors > 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={handleOpenSettings}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
                <Button
                  size="sm"
                  className="flex-1 gap-2 shadow-sm"
                  onClick={handleOpenClientView}
                >
                  <Presentation className="h-4 w-4" />
                  Client View
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Add Project Card */}
          <Card
            className="border-dashed border-2 border-slate-300 hover:border-primary/50 hover:bg-slate-50 transition-all duration-300 cursor-pointer flex items-center justify-center min-h-[200px]"
            onClick={handleCreateNew}
          >
            <div className="text-center text-muted-foreground">
              <Plus className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="font-medium">Create New Project</p>
            </div>
          </Card>
        </div>
      </main>

      {/* Settings Modal */}
      <ProjectSettingsModal
        open={settingsModalOpen}
        onOpenChange={setSettingsModalOpen}
        inputs={project.inputs}
        baseValues={project.baseValues}
        onInputsChange={handleInputsChange}
        onBaseValuesChange={handleBaseValuesChange}
      />
    </div>
  );
}
