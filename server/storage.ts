import { eq } from "drizzle-orm";
import { db } from "./db";
import { users, type User, type InsertUser, type UpdateProfile } from "@shared/schema";

export async function getUser(id: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.username, username));
  return user;
}

export async function createUser(insertUser: InsertUser): Promise<User> {
  const [user] = await db.insert(users).values(insertUser).returning();
  return user;
}

export async function updateUserProfile(id: string, updates: UpdateProfile): Promise<User | undefined> {
  const updateData: Record<string, any> = {};
  if (updates.displayName !== undefined) updateData.displayName = updates.displayName;
  if (updates.currency !== undefined) updateData.currency = updates.currency;
  if (updates.monthlyBudget !== undefined) updateData.monthlyBudget = updates.monthlyBudget;
  if (updates.dailyBudgetTarget !== undefined) updateData.dailyBudgetTarget = updates.dailyBudgetTarget;

  if (Object.keys(updateData).length === 0) {
    return getUser(id);
  }

  const [user] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
  return user;
}
