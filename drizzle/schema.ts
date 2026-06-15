import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
} from "drizzle-orm/mysql-core";

// ─── Users ───────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["tenant", "manager", "contractor", "admin"]).default("tenant").notNull(),
  phone: varchar("phone", { length: 32 }),
  avatarUrl: text("avatarUrl"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Properties ──────────────────────────────────────────────────────────────
export const properties = mysqlTable("properties", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }),
  postcode: varchar("postcode", { length: 20 }),
  managerId: int("managerId"), // FK → users.id (manager)
  description: text("description"),
  imageUrl: text("imageUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Property = typeof properties.$inferSelect;
export type InsertProperty = typeof properties.$inferInsert;

// ─── Units ───────────────────────────────────────────────────────────────────
export const units = mysqlTable("units", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull(), // FK → properties.id
  unitNumber: varchar("unitNumber", { length: 50 }).notNull(),
  floor: varchar("floor", { length: 20 }),
  tenantId: int("tenantId"), // FK → users.id (tenant), nullable
  bedrooms: int("bedrooms").default(1),
  bathrooms: int("bathrooms").default(1),
  isOccupied: boolean("isOccupied").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Unit = typeof units.$inferSelect;
export type InsertUnit = typeof units.$inferInsert;

// ─── Tickets ─────────────────────────────────────────────────────────────────
export const tickets = mysqlTable("tickets", {
  id: int("id").autoincrement().primaryKey(),
  ticketNumber: varchar("ticketNumber", { length: 20 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: mysqlEnum("category", [
    "plumbing",
    "electrical",
    "hvac",
    "structural",
    "appliance",
    "pest_control",
    "cleaning",
    "security",
    "other",
  ]).notNull(),
  priority: mysqlEnum("priority", ["emergency", "high", "medium", "low"]).default("medium").notNull(),
  status: mysqlEnum("status", [
    "submitted",
    "under_review",
    "assigned",
    "in_progress",
    "completed",
    "closed",
  ]).default("submitted").notNull(),
  tenantId: int("tenantId").notNull(),   // FK → users.id
  propertyId: int("propertyId"),         // FK → properties.id
  unitId: int("unitId"),                 // FK → units.id
  assignedManagerId: int("assignedManagerId"), // FK → users.id (manager)
  assignedContractorId: int("assignedContractorId"), // FK → users.id (contractor)
  internalNotes: text("internalNotes"),
  estimatedCost: varchar("estimatedCost", { length: 50 }),
  scheduledDate: timestamp("scheduledDate"),
  completedAt: timestamp("completedAt"),
  closedAt: timestamp("closedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = typeof tickets.$inferInsert;

// ─── Ticket Photos ────────────────────────────────────────────────────────────
export const ticketPhotos = mysqlTable("ticket_photos", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticketId").notNull(), // FK → tickets.id
  uploadedById: int("uploadedById").notNull(), // FK → users.id
  photoType: mysqlEnum("photoType", ["submission", "progress", "completion"]).default("submission").notNull(),
  storageKey: text("storageKey").notNull(),
  url: text("url").notNull(),
  caption: varchar("caption", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TicketPhoto = typeof ticketPhotos.$inferSelect;
export type InsertTicketPhoto = typeof ticketPhotos.$inferInsert;

// ─── Ticket Comments ──────────────────────────────────────────────────────────
export const ticketComments = mysqlTable("ticket_comments", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticketId").notNull(), // FK → tickets.id
  authorId: int("authorId").notNull(), // FK → users.id
  content: text("content").notNull(),
  isInternal: boolean("isInternal").default(false).notNull(), // manager-only notes
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TicketComment = typeof ticketComments.$inferSelect;
export type InsertTicketComment = typeof ticketComments.$inferInsert;

// ─── Notifications ────────────────────────────────────────────────────────────
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // FK → users.id (recipient)
  ticketId: int("ticketId"),       // FK → tickets.id (optional)
  type: mysqlEnum("type", [
    "ticket_submitted",
    "ticket_assigned",
    "status_changed",
    "comment_added",
    "ticket_completed",
    "ticket_closed",
    "role_changed",
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
