import { pgTable, text, serial, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const presentations = pgTable("presentations", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull(),
  theme: text("theme").notNull(),
  variant: text("variant").notNull().default("professional"),
  language: text("language").notNull().default("en"),
  includeImages: boolean("include_images").notNull().default(true),
  summarize: boolean("summarize").notNull().default(false),
  chartType: text("chart_type"),
  slides: jsonb("slides").notNull().default([]),
});

export const insertPresentationSchema = createInsertSchema(presentations).pick({
  topic: true,
  theme: true,
  variant: true,
  language: true,
  includeImages: true,
  summarize: true,
  chartType: true,
});

export const themeSchema = z.enum(["corporate", "creative", "minimal", "bold"]);
export const variantSchema = z.enum(["professional", "tint", "vibrant"]);
export const languageSchema = z.enum(["en", "es", "fr", "de"]);
export const chartTypeSchema = z.enum(["bar", "line", "pie", "scatter"]).optional();
