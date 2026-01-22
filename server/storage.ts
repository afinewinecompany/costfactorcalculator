import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "./db";
import {
  type User,
  type InsertUser,
  type Project,
  type InsertProject,
  type SavedEstimate,
  type InsertSavedEstimate,
  type UpdateSavedEstimate,
  users,
  projects,
  savedEstimates,
} from "@shared/schema";

// ============================================================================
// STORAGE INTERFACE
// ============================================================================

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Projects
  listProjects(includeArchived?: boolean): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  getProjectWithEstimates(
    id: string
  ): Promise<(Project & { estimates: SavedEstimate[] }) | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(
    id: string,
    updates: Partial<InsertProject>
  ): Promise<Project | undefined>;
  archiveProject(id: string): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;

  // Saved Estimates
  listEstimatesByProject(
    projectId: string,
    includeArchived?: boolean
  ): Promise<SavedEstimate[]>;
  getEstimate(id: string): Promise<SavedEstimate | undefined>;
  createEstimate(estimate: InsertSavedEstimate): Promise<SavedEstimate>;
  updateEstimate(
    id: string,
    updates: UpdateSavedEstimate
  ): Promise<SavedEstimate | undefined>;
  archiveEstimate(id: string): Promise<SavedEstimate | undefined>;
  deleteEstimate(id: string): Promise<boolean>;
}

// ============================================================================
// DATABASE STORAGE IMPLEMENTATION
// ============================================================================

export class DatabaseStorage implements IStorage {
  // --------------------------------------------------------------------------
  // USER METHODS
  // --------------------------------------------------------------------------

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // --------------------------------------------------------------------------
  // PROJECT METHODS
  // --------------------------------------------------------------------------

  async listProjects(includeArchived = false): Promise<Project[]> {
    if (includeArchived) {
      return db.select().from(projects).orderBy(desc(projects.createdAt));
    }
    return db
      .select()
      .from(projects)
      .where(eq(projects.isArchived, 0))
      .orderBy(desc(projects.createdAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));
    return project;
  }

  async getProjectWithEstimates(
    id: string
  ): Promise<(Project & { estimates: SavedEstimate[] }) | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));

    if (!project) {
      return undefined;
    }

    const estimates = await db
      .select()
      .from(savedEstimates)
      .where(
        and(
          eq(savedEstimates.projectId, id),
          eq(savedEstimates.isArchived, 0)
        )
      )
      .orderBy(desc(savedEstimates.createdAt));

    return { ...project, estimates };
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [created] = await db.insert(projects).values(project).returning();
    return created;
  }

  async updateProject(
    id: string,
    updates: Partial<InsertProject>
  ): Promise<Project | undefined> {
    const [updated] = await db
      .update(projects)
      .set({
        ...updates,
        updatedAt: sql`NOW()`,
      })
      .where(eq(projects.id, id))
      .returning();
    return updated;
  }

  async archiveProject(id: string): Promise<Project | undefined> {
    const [archived] = await db
      .update(projects)
      .set({
        isArchived: 1,
        updatedAt: sql`NOW()`,
      })
      .where(eq(projects.id, id))
      .returning();
    return archived;
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // --------------------------------------------------------------------------
  // SAVED ESTIMATE METHODS
  // --------------------------------------------------------------------------

  async listEstimatesByProject(
    projectId: string,
    includeArchived = false
  ): Promise<SavedEstimate[]> {
    if (includeArchived) {
      return db
        .select()
        .from(savedEstimates)
        .where(eq(savedEstimates.projectId, projectId))
        .orderBy(desc(savedEstimates.createdAt));
    }
    return db
      .select()
      .from(savedEstimates)
      .where(
        and(
          eq(savedEstimates.projectId, projectId),
          eq(savedEstimates.isArchived, 0)
        )
      )
      .orderBy(desc(savedEstimates.createdAt));
  }

  async getEstimate(id: string): Promise<SavedEstimate | undefined> {
    const [estimate] = await db
      .select()
      .from(savedEstimates)
      .where(eq(savedEstimates.id, id));
    return estimate;
  }

  async createEstimate(estimate: InsertSavedEstimate): Promise<SavedEstimate> {
    const [created] = await db
      .insert(savedEstimates)
      .values(estimate)
      .returning();
    return created;
  }

  async updateEstimate(
    id: string,
    updates: UpdateSavedEstimate
  ): Promise<SavedEstimate | undefined> {
    const [updated] = await db
      .update(savedEstimates)
      .set({
        ...updates,
        updatedAt: sql`NOW()`,
      })
      .where(eq(savedEstimates.id, id))
      .returning();
    return updated;
  }

  async archiveEstimate(id: string): Promise<SavedEstimate | undefined> {
    const [archived] = await db
      .update(savedEstimates)
      .set({
        isArchived: 1,
        updatedAt: sql`NOW()`,
      })
      .where(eq(savedEstimates.id, id))
      .returning();
    return archived;
  }

  async deleteEstimate(id: string): Promise<boolean> {
    const result = await db
      .delete(savedEstimates)
      .where(eq(savedEstimates.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

// Export singleton instance
export const storage = new DatabaseStorage();
