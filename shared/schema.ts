import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  decimal,
  integer,
  jsonb,
  index,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================================================
// USERS TABLE
// ============================================================================

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ============================================================================
// PROJECTS TABLE
// ============================================================================
// Projects represent real estate developments that can have multiple estimates

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    clientName: varchar("client_name", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`NOW()`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`NOW()`),
    createdById: varchar("created_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    isArchived: integer("is_archived").notNull().default(0), // 0 = active, 1 = archived
  },
  (table) => [
    index("projects_created_at_idx").on(table.createdAt),
    index("projects_created_by_idx").on(table.createdById),
    index("projects_name_idx").on(table.name),
  ]
);

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectProjectSchema = createSelectSchema(projects);

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// ============================================================================
// SAVED ESTIMATES TABLE
// ============================================================================
// Stores complete budget estimate snapshots for comparison and retrieval

/**
 * JSON structure for project inputs stored in the estimate
 */
export const projectInputsSchema = z.object({
  projectName: z.string(),
  projectSize: z.number().positive(), // RSF (Rentable Square Feet)
  floors: z.number().int().positive(),
  location: z.string(),
  tiAllowancePerSF: z.number().nonnegative().optional(), // TI Allowance in $/SF
});

/**
 * JSON structure for technology base values
 */
export const technologyValuesSchema = z.object({
  av: z.number().nonnegative(),
  it: z.number().nonnegative(),
  sec: z.number().nonnegative(),
});

/**
 * JSON structure for base cost values per category
 */
export const baseValuesSchema = z.object({
  constructionCosts: z.number().nonnegative(),
  designFees: z.number().nonnegative(),
  ffeAppliances: z.number().nonnegative(),
  signage: z.number().nonnegative(),
  technology: technologyValuesSchema,
  other: z.number().nonnegative(),
});

/**
 * JSON structure for slider values (slider ID -> position 0-100)
 */
export const sliderValuesSchema = z.record(z.string(), z.number().min(0).max(100));

/**
 * JSON structure for category results (computed values)
 */
export const categoryResultSchema = z.object({
  category: z.string(),
  factor: z.number(),
  adjustedFactor: z.number(),
  costPerRSF: z.number(),
  totalCost: z.number(),
});

/**
 * JSON structure for computed output snapshot
 */
export const computedOutputSchema = z.object({
  uniqueProjectFactor: z.number(),
  categories: z.array(categoryResultSchema),
  subtotal: z.number(),
  contingencyPercent: z.number(),
  contingency: z.number(),
  grandTotal: z.number(),
  baseTotalPerRSF: z.number(),
  grandTotalPerRSF: z.number(),
  tiAllowancePerSF: z.number(),
  tiAllowanceTotal: z.number(),
  clientTotal: z.number(),
  clientTotalPerRSF: z.number(),
});

export const savedEstimates = pgTable(
  "saved_estimates",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),

    // User-provided identifier for this estimate version
    name: varchar("name", { length: 255 }).notNull(),

    // Optional description for notes about this estimate
    description: text("description"),

    // Link to parent project (required - every estimate belongs to a project)
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),

    // Link to user who created this estimate (optional for anonymous saves)
    createdById: varchar("created_by_id").references(() => users.id, {
      onDelete: "set null",
    }),

    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`NOW()`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`NOW()`),

    // ========================================================================
    // ESTIMATE INPUT DATA (stored as JSONB for flexibility)
    // ========================================================================

    // Project parameters at time of estimate
    inputs: jsonb("inputs").notNull().$type<z.infer<typeof projectInputsSchema>>(),

    // Slider positions (0-100) for all sliders at time of estimate
    sliderValues: jsonb("slider_values").notNull().$type<z.infer<typeof sliderValuesSchema>>(),

    // Base cost values per category
    baseValues: jsonb("base_values").notNull().$type<z.infer<typeof baseValuesSchema>>(),

    // ========================================================================
    // COMPUTED TOTALS (denormalized for quick display without recalculation)
    // ========================================================================

    // Full computed output snapshot for detailed display
    computedOutput: jsonb("computed_output").$type<z.infer<typeof computedOutputSchema>>(),

    // Key totals stored as columns for efficient querying and sorting
    grandTotal: decimal("grand_total", { precision: 14, scale: 2 }).notNull(),
    grandTotalPerRSF: decimal("grand_total_per_rsf", { precision: 10, scale: 2 }).notNull(),
    clientTotal: decimal("client_total", { precision: 14, scale: 2 }).notNull(),
    clientTotalPerRSF: decimal("client_total_per_rsf", { precision: 10, scale: 2 }).notNull(),

    // Project size stored for quick reference
    projectSize: integer("project_size").notNull(), // RSF

    // Soft delete / archive flag
    isArchived: integer("is_archived").notNull().default(0), // 0 = active, 1 = archived
  },
  (table) => [
    // Primary query pattern: get all estimates for a project
    index("saved_estimates_project_id_idx").on(table.projectId),

    // Query estimates by creator
    index("saved_estimates_created_by_idx").on(table.createdById),

    // Sort by creation date
    index("saved_estimates_created_at_idx").on(table.createdAt),

    // Composite index for common query: active estimates for a project, sorted by date
    index("saved_estimates_project_active_idx").on(
      table.projectId,
      table.isArchived,
      table.createdAt
    ),

    // Index for sorting/filtering by totals
    index("saved_estimates_grand_total_idx").on(table.grandTotal),
    index("saved_estimates_client_total_idx").on(table.clientTotal),
  ]
);

// ============================================================================
// DRIZZLE-ZOD SCHEMAS FOR VALIDATION
// ============================================================================

export const insertSavedEstimateSchema = createInsertSchema(savedEstimates, {
  inputs: projectInputsSchema,
  sliderValues: sliderValuesSchema,
  baseValues: baseValuesSchema,
  computedOutput: computedOutputSchema.optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectSavedEstimateSchema = createSelectSchema(savedEstimates, {
  inputs: projectInputsSchema,
  sliderValues: sliderValuesSchema,
  baseValues: baseValuesSchema,
  computedOutput: computedOutputSchema.optional(),
});

// Partial update schema (for PATCH operations)
export const updateSavedEstimateSchema = insertSavedEstimateSchema.partial();

export type InsertSavedEstimate = z.infer<typeof insertSavedEstimateSchema>;
export type SavedEstimate = typeof savedEstimates.$inferSelect;
export type UpdateSavedEstimate = z.infer<typeof updateSavedEstimateSchema>;

// ============================================================================
// TYPE EXPORTS FOR JSON FIELDS
// ============================================================================

export type ProjectInputs = z.infer<typeof projectInputsSchema>;
export type BaseValues = z.infer<typeof baseValuesSchema>;
export type SliderValues = z.infer<typeof sliderValuesSchema>;
export type ComputedOutput = z.infer<typeof computedOutputSchema>;
export type CategoryResult = z.infer<typeof categoryResultSchema>;
