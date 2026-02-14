import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull().default('User'),
  currency: text("currency").notNull().default('৳'),
  monthlyBudget: real("monthly_budget").notNull().default(0),
  dailyBudgetTarget: real("daily_budget_target").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  currency: z.string().min(1).max(5).optional(),
  monthlyBudget: z.number().min(0).optional(),
  dailyBudgetTarget: z.number().min(0).optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
