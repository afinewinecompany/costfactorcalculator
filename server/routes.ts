import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertProjectSchema,
  insertSavedEstimateSchema,
  updateSavedEstimateSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // ============================================================================
  // HEALTH CHECK
  // ============================================================================

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ============================================================================
  // PROJECT ROUTES
  // ============================================================================

  // List all projects
  app.get("/api/projects", async (req, res) => {
    try {
      const includeArchived = req.query.includeArchived === "true";
      const projects = await storage.listProjects(includeArchived);
      res.json(projects);
    } catch (error) {
      console.error("Error listing projects:", error);
      res.status(500).json({ error: "Failed to list projects" });
    }
  });

  // Get single project with its estimates
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const project = await storage.getProjectWithEstimates(id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error getting project:", error);
      res.status(500).json({ error: "Failed to get project" });
    }
  });

  // Create a new project
  app.post("/api/projects", async (req, res) => {
    try {
      const parsed = insertProjectSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid project data",
          details: parsed.error.flatten(),
        });
      }
      const project = await storage.createProject(parsed.data);
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  // Update a project
  app.put("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const parsed = insertProjectSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid project data",
          details: parsed.error.flatten(),
        });
      }
      const project = await storage.updateProject(id, parsed.data);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  // Archive a project (soft delete)
  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const project = await storage.archiveProject(id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error archiving project:", error);
      res.status(500).json({ error: "Failed to archive project" });
    }
  });

  // ============================================================================
  // SAVED ESTIMATES ROUTES
  // ============================================================================

  // List estimates for a project
  app.get("/api/projects/:projectId/estimates", async (req, res) => {
    try {
      const { projectId } = req.params;
      const includeArchived = req.query.includeArchived === "true";
      const estimates = await storage.listEstimatesByProject(
        projectId,
        includeArchived
      );
      res.json(estimates);
    } catch (error) {
      console.error("Error listing estimates:", error);
      res.status(500).json({ error: "Failed to list estimates" });
    }
  });

  // Get single estimate
  app.get("/api/estimates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const estimate = await storage.getEstimate(id);
      if (!estimate) {
        return res.status(404).json({ error: "Estimate not found" });
      }
      res.json(estimate);
    } catch (error) {
      console.error("Error getting estimate:", error);
      res.status(500).json({ error: "Failed to get estimate" });
    }
  });

  // Get multiple estimates by IDs (for comparison page)
  app.get("/api/estimates", async (req, res) => {
    try {
      const idsParam = req.query.ids;
      if (!idsParam || typeof idsParam !== "string") {
        return res.status(400).json({ error: "Missing or invalid ids parameter" });
      }
      const ids = idsParam.split(",").filter(Boolean);
      if (ids.length === 0) {
        return res.json([]);
      }
      // Fetch all estimates by their IDs
      const estimates = await Promise.all(
        ids.map((id) => storage.getEstimate(id))
      );
      // Filter out any undefined (not found) estimates
      res.json(estimates.filter(Boolean));
    } catch (error) {
      console.error("Error getting estimates:", error);
      res.status(500).json({ error: "Failed to get estimates" });
    }
  });

  // Create a new estimate for a project
  app.post("/api/projects/:projectId/estimates", async (req, res) => {
    try {
      const { projectId } = req.params;

      // Verify project exists
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Validate and create estimate
      const estimateData = {
        ...req.body,
        projectId,
      };

      const parsed = insertSavedEstimateSchema.safeParse(estimateData);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid estimate data",
          details: parsed.error.flatten(),
        });
      }

      const estimate = await storage.createEstimate(parsed.data);
      res.status(201).json(estimate);
    } catch (error) {
      console.error("Error creating estimate:", error);
      res.status(500).json({ error: "Failed to create estimate" });
    }
  });

  // Update an estimate
  app.put("/api/estimates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const parsed = updateSavedEstimateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid estimate data",
          details: parsed.error.flatten(),
        });
      }
      const estimate = await storage.updateEstimate(id, parsed.data);
      if (!estimate) {
        return res.status(404).json({ error: "Estimate not found" });
      }
      res.json(estimate);
    } catch (error) {
      console.error("Error updating estimate:", error);
      res.status(500).json({ error: "Failed to update estimate" });
    }
  });

  // Archive an estimate (soft delete)
  app.delete("/api/estimates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const estimate = await storage.archiveEstimate(id);
      if (!estimate) {
        return res.status(404).json({ error: "Estimate not found" });
      }
      res.json(estimate);
    } catch (error) {
      console.error("Error archiving estimate:", error);
      res.status(500).json({ error: "Failed to archive estimate" });
    }
  });

  // ============================================================================
  // CONVENIENCE ROUTES
  // ============================================================================

  // Create project and first estimate in one call (for initial save from presentation)
  app.post("/api/projects-with-estimate", async (req, res) => {
    try {
      const { project: projectData, estimate: estimateData } = req.body;

      // Create the project first
      const projectParsed = insertProjectSchema.safeParse(projectData);
      if (!projectParsed.success) {
        return res.status(400).json({
          error: "Invalid project data",
          details: projectParsed.error.flatten(),
        });
      }

      const project = await storage.createProject(projectParsed.data);

      // Then create the estimate
      const fullEstimateData = {
        ...estimateData,
        projectId: project.id,
      };

      const estimateParsed = insertSavedEstimateSchema.safeParse(fullEstimateData);
      if (!estimateParsed.success) {
        // Rollback project creation on estimate validation failure
        await storage.deleteProject(project.id);
        return res.status(400).json({
          error: "Invalid estimate data",
          details: estimateParsed.error.flatten(),
        });
      }

      const estimate = await storage.createEstimate(estimateParsed.data);

      res.status(201).json({
        project,
        estimate,
      });
    } catch (error) {
      console.error("Error creating project with estimate:", error);
      res.status(500).json({ error: "Failed to create project with estimate" });
    }
  });

  return httpServer;
}
