import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

// Mock all db functions
vi.mock("./db", () => ({
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  getAllUsers: vi.fn().mockResolvedValue([]),
  getUserById: vi.fn().mockResolvedValue(null),
  getUsersByRole: vi.fn().mockResolvedValue([]),
  updateUserRole: vi.fn().mockResolvedValue(undefined),
  getAllProperties: vi.fn().mockResolvedValue([]),
  getPropertyById: vi.fn().mockResolvedValue(null),
  createProperty: vi.fn().mockResolvedValue(undefined),
  updateProperty: vi.fn().mockResolvedValue(undefined),
  getPropertiesByManager: vi.fn().mockResolvedValue([]),
  getUnitsByProperty: vi.fn().mockResolvedValue([]),
  getUnitByTenant: vi.fn().mockResolvedValue(null),
  createUnit: vi.fn().mockResolvedValue(undefined),
  updateUnit: vi.fn().mockResolvedValue(undefined),
  createTicket: vi.fn().mockResolvedValue({ id: 1, ticketNumber: "HOL-TEST-001", title: "Test", status: "submitted", priority: "medium", category: "plumbing", description: "Test", tenantId: 1, createdAt: new Date(), updatedAt: new Date() }),
  getAllTickets: vi.fn().mockResolvedValue([]),
  getTicketById: vi.fn().mockResolvedValue(null),
  getTicketsByTenant: vi.fn().mockResolvedValue([]),
  getTicketsByContractor: vi.fn().mockResolvedValue([]),
  getTicketsByManager: vi.fn().mockResolvedValue([]),
  updateTicket: vi.fn().mockResolvedValue(null),
  getTicketStats: vi.fn().mockResolvedValue({ total: 0, submitted: 0, under_review: 0, assigned: 0, in_progress: 0, completed: 0, closed: 0 }),
  addTicketPhoto: vi.fn().mockResolvedValue(undefined),
  getTicketPhotos: vi.fn().mockResolvedValue([]),
  addComment: vi.fn().mockResolvedValue(undefined),
  getCommentsByTicket: vi.fn().mockResolvedValue([]),
  createNotification: vi.fn().mockResolvedValue(undefined),
  getNotificationsByUser: vi.fn().mockResolvedValue([]),
  markNotificationRead: vi.fn().mockResolvedValue(undefined),
  markAllNotificationsRead: vi.fn().mockResolvedValue(undefined),
  getUnreadNotificationCount: vi.fn().mockResolvedValue(0),
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ key: "test-key", url: "/manus-storage/test-key" }),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function makeUser(overrides: Partial<AuthenticatedUser> = {}): AuthenticatedUser {
  return {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };
}

function makeCtx(user?: AuthenticatedUser): TrpcContext {
  const clearedCookies: unknown[] = [];
  return {
    user: user ?? null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: (_name: string, _opts: unknown) => clearedCookies.push({ _name, _opts }),
    } as TrpcContext["res"],
  };
}

describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const clearedCookies: { name: string; options: Record<string, unknown> }[] = [];
    const ctx: TrpcContext = {
      user: makeUser(),
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {
        clearCookie: (name: string, options: Record<string, unknown>) => clearedCookies.push({ name, options }),
      } as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({ maxAge: -1 });
  });
});

describe("auth.me", () => {
  it("returns null when unauthenticated", async () => {
    const caller = appRouter.createCaller(makeCtx(undefined));
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user when authenticated", async () => {
    const user = makeUser({ role: "tenant" });
    const caller = appRouter.createCaller(makeCtx(user));
    const result = await caller.auth.me();
    expect(result).toMatchObject({ id: 1, email: "test@example.com" });
  });
});

describe("tickets.list", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makeCtx(undefined));
    await expect(caller.tickets.list()).rejects.toThrow();
  });

  it("returns tickets for authenticated tenant", async () => {
    const { getTicketsByTenant } = await import("./db");
    vi.mocked(getTicketsByTenant).mockResolvedValueOnce([]);
    const caller = appRouter.createCaller(makeCtx(makeUser({ role: "tenant" })));
    const result = await caller.tickets.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("returns all tickets for admin", async () => {
    const { getAllTickets } = await import("./db");
    vi.mocked(getAllTickets).mockResolvedValueOnce([]);
    const caller = appRouter.createCaller(makeCtx(makeUser({ role: "admin" })));
    const result = await caller.tickets.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("tickets.submit", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makeCtx(undefined));
    await expect(caller.tickets.submit({ title: "Test", description: "Test description", category: "plumbing", priority: "medium" })).rejects.toThrow();
  });

  it("creates a ticket for authenticated user", async () => {
    const caller = appRouter.createCaller(makeCtx(makeUser({ role: "tenant" })));
    const result = await caller.tickets.submit({ title: "Leaking tap", description: "Water dripping from kitchen tap", category: "plumbing", priority: "medium" });
    expect(result).toBeDefined();
  });
});

describe("tickets.stats", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makeCtx(undefined));
    await expect(caller.tickets.stats()).rejects.toThrow();
  });

  it("returns stats for authenticated user", async () => {
    const caller = appRouter.createCaller(makeCtx(makeUser({ role: "manager" })));
    const result = await caller.tickets.stats();
    expect(result).toMatchObject({ total: expect.any(Number) });
  });
});

describe("notifications.list", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makeCtx(undefined));
    await expect(caller.notifications.list()).rejects.toThrow();
  });

  it("returns notifications for authenticated user", async () => {
    const caller = appRouter.createCaller(makeCtx(makeUser()));
    const result = await caller.notifications.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("users.list", () => {
  it("requires admin role", async () => {
    const caller = appRouter.createCaller(makeCtx(makeUser({ role: "tenant" })));
    await expect(caller.users.list()).rejects.toThrow();
  });

  it("returns users for admin", async () => {
    const caller = appRouter.createCaller(makeCtx(makeUser({ role: "admin" })));
    const result = await caller.users.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("properties.list", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(makeCtx(undefined));
    await expect(caller.properties.list()).rejects.toThrow();
  });

  it("returns properties for authenticated user", async () => {
    const caller = appRouter.createCaller(makeCtx(makeUser({ role: "manager" })));
    const result = await caller.properties.list();
    expect(Array.isArray(result)).toBe(true);
  });
});
