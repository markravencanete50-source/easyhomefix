import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  addComment,
  addTicketPhoto,
  createNotification,
  createProperty,
  createTicket,
  createUnit,
  getAllProperties,
  getAllTickets,
  getAllUsers,
  getPropertyById,
  getCommentsByTicket,
  getNotificationsByUser,
  getPropertiesByManager,
  getTicketById,
  getTicketPhotos,
  getTicketStats,
  getTicketsByContractor,
  getTicketsByManager,
  getTicketsByTenant,
  getUnitByTenant,
  getUnitsByProperty,
  getUserById,
  getUsersByRole,
  markAllNotificationsRead,
  markNotificationRead,
  getUnreadNotificationCount,
  updateProperty,
  updateTicket,
  updateUnit,
  updateUserRole,
  upsertUser,
} from "./db";
import { storagePut } from "./storage";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

// ─── Role guards ──────────────────────────────────────────────────────────────
const managerOrAdminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "manager" && ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Manager or Admin access required" });
  }
  return next({ ctx });
});

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// ─── Notification helper ──────────────────────────────────────────────────────
async function notifyUsers(
  userIds: (number | null | undefined)[],
  type: "ticket_submitted" | "ticket_assigned" | "status_changed" | "comment_added" | "ticket_completed" | "ticket_closed" | "role_changed",
  title: string,
  message: string,
  ticketId?: number
) {
  const validIds = userIds.filter((id): id is number => id != null && id > 0);
  for (const userId of validIds) {
    await createNotification({ userId, type, title, message, ticketId });
  }
}

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    updateProfile: protectedProcedure
      .input(z.object({ name: z.string().optional(), phone: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        await upsertUser({ openId: ctx.user.openId, ...input });
        return { success: true };
      }),
  }),

  // ─── Users ────────────────────────────────────────────────────────────────
  users: router({
    list: adminProcedure.query(() => getAllUsers()),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => getUserById(input.id)),
    byRole: adminProcedure.input(z.object({ role: z.enum(["tenant", "manager", "contractor", "admin"]) })).query(({ input }) => getUsersByRole(input.role)),
    updateRole: adminProcedure
      .input(z.object({ userId: z.number(), role: z.enum(["tenant", "manager", "contractor", "admin"]) }))
      .mutation(async ({ input }) => {
        await updateUserRole(input.userId, input.role);
        const user = await getUserById(input.userId);
        if (user) {
          await notifyUsers([user.id], "role_changed", "Your role has been updated", `Your account role has been changed to ${input.role}.`);
        }
        return { success: true };
      }),
    contractors: protectedProcedure.query(() => getUsersByRole("contractor")),
    managers: adminProcedure.query(() => getUsersByRole("manager")),
  }),

  // ─── Properties ───────────────────────────────────────────────────────────
  properties: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role === "admin") return getAllProperties();
      if (ctx.user.role === "manager") return getPropertiesByManager(ctx.user.id);
      return getAllProperties();
    }),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => getPropertyById(input.id)),
    create: managerOrAdminProcedure
      .input(z.object({
        name: z.string().min(1),
        address: z.string().min(1),
        city: z.string().optional(),
        postcode: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await createProperty({ ...input, managerId: ctx.user.id });
        return { success: true };
      }),
    update: managerOrAdminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        postcode: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateProperty(id, data);
        return { success: true };
      }),
    units: protectedProcedure.input(z.object({ propertyId: z.number() })).query(({ input }) => getUnitsByProperty(input.propertyId)),
    myUnit: protectedProcedure.query(({ ctx }) => getUnitByTenant(ctx.user.id)),
    createUnit: managerOrAdminProcedure
      .input(z.object({
        propertyId: z.number(),
        unitNumber: z.string().min(1),
        floor: z.string().optional(),
        tenantId: z.number().optional(),
        bedrooms: z.number().optional(),
        bathrooms: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        await createUnit({ ...input, isOccupied: !!input.tenantId });
        return { success: true };
      }),
    assignTenant: managerOrAdminProcedure
      .input(z.object({ unitId: z.number(), tenantId: z.number().nullable() }))
      .mutation(async ({ input }) => {
        await updateUnit(input.unitId, { tenantId: input.tenantId ?? undefined, isOccupied: input.tenantId != null });
        return { success: true };
      }),
  }),

  // ─── Tickets ──────────────────────────────────────────────────────────────
  tickets: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role === "admin") return getAllTickets();
      if (ctx.user.role === "manager") return getAllTickets();
      if (ctx.user.role === "contractor") return getTicketsByContractor(ctx.user.id);
      return getTicketsByTenant(ctx.user.id);
    }),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => getTicketById(input.id)),
    stats: protectedProcedure.query(() => getTicketStats()),
    myTickets: protectedProcedure.query(({ ctx }) => getTicketsByTenant(ctx.user.id)),

    submit: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        category: z.enum(["plumbing", "electrical", "hvac", "structural", "appliance", "pest_control", "cleaning", "security", "other"]),
        priority: z.enum(["emergency", "high", "medium", "low"]),
        propertyId: z.number().optional(),
        unitId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const ticket = await createTicket({ ...input, tenantId: ctx.user.id });
        // Notify all managers
        const managers = await getUsersByRole("manager");
        await notifyUsers(
          managers.map(m => m.id),
          "ticket_submitted",
          "New Maintenance Request",
          `${ctx.user.name || "A tenant"} submitted a new ${input.priority} priority ticket: "${input.title}"`,
          ticket?.id
        );
        return ticket;
      }),

    updateStatus: managerOrAdminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["submitted", "under_review", "assigned", "in_progress", "completed", "closed"]),
        internalNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const ticket = await getTicketById(input.id);
        if (!ticket) throw new TRPCError({ code: "NOT_FOUND" });
        const updates: Record<string, unknown> = { status: input.status };
        if (input.internalNotes) updates.internalNotes = input.internalNotes;
        if (input.status === "completed") updates.completedAt = new Date();
        if (input.status === "closed") updates.closedAt = new Date();
        await updateTicket(input.id, updates as Parameters<typeof updateTicket>[1]);
        const statusLabel = input.status.replace(/_/g, " ");
        await notifyUsers(
          [ticket.tenantId, ticket.assignedContractorId],
          "status_changed",
          "Ticket Status Updated",
          `Your ticket "${ticket.title}" status changed to ${statusLabel}.`,
          ticket.id
        );
        return { success: true };
      }),

    assign: managerOrAdminProcedure
      .input(z.object({
        id: z.number(),
        contractorId: z.number(),
        estimatedCost: z.string().optional(),
        scheduledDate: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const ticket = await getTicketById(input.id);
        if (!ticket) throw new TRPCError({ code: "NOT_FOUND" });
        const updates: Record<string, unknown> = {
          assignedContractorId: input.contractorId,
          assignedManagerId: ctx.user.id,
          status: "assigned",
        };
        if (input.estimatedCost) updates.estimatedCost = input.estimatedCost;
        if (input.scheduledDate) updates.scheduledDate = new Date(input.scheduledDate);
        await updateTicket(input.id, updates as Parameters<typeof updateTicket>[1]);
        await notifyUsers(
          [input.contractorId],
          "ticket_assigned",
          "New Job Assigned",
          `You have been assigned a new maintenance job: "${ticket.title}"`,
          ticket.id
        );
        await notifyUsers(
          [ticket.tenantId],
          "ticket_assigned",
          "Contractor Assigned",
          `A contractor has been assigned to your ticket "${ticket.title}"`,
          ticket.id
        );
        return { success: true };
      }),

    contractorUpdate: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["in_progress", "completed"]),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "contractor" && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        const ticket = await getTicketById(input.id);
        if (!ticket) throw new TRPCError({ code: "NOT_FOUND" });
        if (ticket.assignedContractorId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not assigned to this ticket" });
        }
        const updates: Record<string, unknown> = { status: input.status };
        if (input.status === "completed") updates.completedAt = new Date();
        await updateTicket(input.id, updates as Parameters<typeof updateTicket>[1]);
        const statusLabel = input.status.replace(/_/g, " ");
        await notifyUsers(
          [ticket.tenantId, ticket.assignedManagerId],
          "status_changed",
          "Job Status Updated",
          `Contractor updated ticket "${ticket.title}" to ${statusLabel}.`,
          ticket.id
        );
        return { success: true };
      }),

    addInternalNote: managerOrAdminProcedure
      .input(z.object({ id: z.number(), notes: z.string().min(1) }))
      .mutation(async ({ input }) => {
        await updateTicket(input.id, { internalNotes: input.notes });
        return { success: true };
      }),

    // Photos
    photos: protectedProcedure.input(z.object({ ticketId: z.number() })).query(({ input }) => getTicketPhotos(input.ticketId)),
    uploadPhoto: protectedProcedure
      .input(z.object({
        ticketId: z.number(),
        photoType: z.enum(["submission", "progress", "completion"]),
        base64Data: z.string(),
        mimeType: z.string(),
        caption: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const buffer = Buffer.from(input.base64Data, "base64");
        const ext = input.mimeType.split("/")[1] || "jpg";
        const key = `tickets/${input.ticketId}/${input.photoType}/${Date.now()}.${ext}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        await addTicketPhoto({
          ticketId: input.ticketId,
          uploadedById: ctx.user.id,
          photoType: input.photoType,
          storageKey: key,
          url,
          caption: input.caption,
        });
        return { url, success: true };
      }),

    // Comments
    comments: protectedProcedure
      .input(z.object({ ticketId: z.number() }))
      .query(async ({ ctx, input }) => {
        const includeInternal = ctx.user.role === "manager" || ctx.user.role === "admin";
        return getCommentsByTicket(input.ticketId, includeInternal);
      }),
    addComment: protectedProcedure
      .input(z.object({
        ticketId: z.number(),
        content: z.string().min(1),
        isInternal: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        if (input.isInternal && ctx.user.role !== "manager" && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await addComment({ ticketId: input.ticketId, authorId: ctx.user.id, content: input.content, isInternal: input.isInternal });
        const ticket = await getTicketById(input.ticketId);
        if (ticket && !input.isInternal) {
          const notifyIds = [ticket.tenantId, ticket.assignedContractorId, ticket.assignedManagerId].filter(id => id !== ctx.user.id);
          await notifyUsers(
            notifyIds,
            "comment_added",
            "New Comment on Ticket",
            `${ctx.user.name || "Someone"} added a comment on ticket "${ticket.title}"`,
            ticket.id
          );
        }
        return { success: true };
      }),
  }),

  // ─── Notifications ─────────────────────────────────────────────────────────
  notifications: router({
    list: protectedProcedure.query(({ ctx }) => getNotificationsByUser(ctx.user.id)),
    unreadCount: protectedProcedure.query(({ ctx }) => getUnreadNotificationCount(ctx.user.id)),
    markRead: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ ctx, input }) => markNotificationRead(input.id, ctx.user.id)),
    markAllRead: protectedProcedure.mutation(({ ctx }) => markAllNotificationsRead(ctx.user.id)),
  }),
});

export type AppRouter = typeof appRouter;
