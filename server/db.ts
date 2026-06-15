import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertNotification,
  InsertProperty,
  InsertTicket,
  InsertTicketComment,
  InsertTicketPhoto,
  InsertUnit,
  InsertUser,
  notifications,
  properties,
  ticketComments,
  ticketPhotos,
  tickets,
  units,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserRole(userId: number, role: "tenant" | "manager" | "contractor" | "admin") {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, userId));
}

export async function getUsersByRole(role: "tenant" | "manager" | "contractor" | "admin") {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).where(eq(users.role, role));
}

// ─── Properties ───────────────────────────────────────────────────────────────

export async function getAllProperties() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(properties).orderBy(desc(properties.createdAt));
}

export async function getPropertyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProperty(data: InsertProperty) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(properties).values(data);
  return result;
}

export async function updateProperty(id: number, data: Partial<InsertProperty>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(properties).set({ ...data, updatedAt: new Date() }).where(eq(properties.id, id));
}

export async function getPropertiesByManager(managerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(properties).where(eq(properties.managerId, managerId));
}

// ─── Units ────────────────────────────────────────────────────────────────────

export async function getUnitsByProperty(propertyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(units).where(eq(units.propertyId, propertyId));
}

export async function getUnitByTenant(tenantId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(units).where(eq(units.tenantId, tenantId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUnit(data: InsertUnit) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.insert(units).values(data);
}

export async function updateUnit(id: number, data: Partial<InsertUnit>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(units).set({ ...data, updatedAt: new Date() }).where(eq(units.id, id));
}

// ─── Tickets ──────────────────────────────────────────────────────────────────

function generateTicketNumber(): string {
  const prefix = "HOL";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export async function createTicket(data: Omit<InsertTicket, "ticketNumber">) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const ticketNumber = generateTicketNumber();
  await db.insert(tickets).values({ ...data, ticketNumber });
  const result = await db.select().from(tickets).where(eq(tickets.ticketNumber, ticketNumber)).limit(1);
  return result[0];
}

export async function getAllTickets() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tickets).orderBy(desc(tickets.createdAt));
}

export async function getTicketById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tickets).where(eq(tickets.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTicketsByTenant(tenantId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tickets).where(eq(tickets.tenantId, tenantId)).orderBy(desc(tickets.createdAt));
}

export async function getTicketsByContractor(contractorId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tickets).where(eq(tickets.assignedContractorId, contractorId)).orderBy(desc(tickets.createdAt));
}

export async function getTicketsByManager(managerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tickets).where(eq(tickets.assignedManagerId, managerId)).orderBy(desc(tickets.createdAt));
}

export async function updateTicket(id: number, data: Partial<InsertTicket>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(tickets).set({ ...data, updatedAt: new Date() }).where(eq(tickets.id, id));
  return getTicketById(id);
}

export async function getTicketStats() {
  const db = await getDb();
  if (!db) return { total: 0, submitted: 0, in_progress: 0, completed: 0, closed: 0 };
  const all = await db.select().from(tickets);
  return {
    total: all.length,
    submitted: all.filter(t => t.status === "submitted").length,
    under_review: all.filter(t => t.status === "under_review").length,
    assigned: all.filter(t => t.status === "assigned").length,
    in_progress: all.filter(t => t.status === "in_progress").length,
    completed: all.filter(t => t.status === "completed").length,
    closed: all.filter(t => t.status === "closed").length,
  };
}

// ─── Ticket Photos ────────────────────────────────────────────────────────────

export async function addTicketPhoto(data: InsertTicketPhoto) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(ticketPhotos).values(data);
}

export async function getTicketPhotos(ticketId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ticketPhotos).where(eq(ticketPhotos.ticketId, ticketId)).orderBy(desc(ticketPhotos.createdAt));
}

// ─── Ticket Comments ──────────────────────────────────────────────────────────

export async function addComment(data: InsertTicketComment) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(ticketComments).values(data);
}

export async function getCommentsByTicket(ticketId: number, includeInternal = false) {
  const db = await getDb();
  if (!db) return [];
  if (includeInternal) {
    return db.select().from(ticketComments).where(eq(ticketComments.ticketId, ticketId)).orderBy(ticketComments.createdAt);
  }
  return db.select().from(ticketComments).where(
    and(eq(ticketComments.ticketId, ticketId), eq(ticketComments.isInternal, false))
  ).orderBy(ticketComments.createdAt);
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) return;
  await db.insert(notifications).values(data);
}

export async function getNotificationsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(50);
}

export async function markNotificationRead(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: true }).where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
}

export async function markAllNotificationsRead(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
}

export async function getUnreadNotificationCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(notifications).where(
    and(eq(notifications.userId, userId), eq(notifications.isRead, false))
  );
  return result.length;
}
