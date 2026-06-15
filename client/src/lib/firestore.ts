// ============================================================
// FixFlow — Firestore Database Service
// Complete schema and CRUD operations for all collections
// ============================================================

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
  increment,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  MaintenanceTicket,
  TicketMessage,
  Notification,
  ActivityLog,
  Property,
  Contractor,
  User,
  TicketStatus,
  TicketFilters,
} from '../types';

// ─── Collection Names ─────────────────────────────────────────
export const COLLECTIONS = {
  USERS: 'users',
  PROPERTIES: 'properties',
  TENANCIES: 'tenancies',
  TICKETS: 'maintenanceTickets',
  MESSAGES: 'ticketMessages',
  CONTRACTORS: 'contractors',
  ATTACHMENTS: 'attachments',
  NOTIFICATIONS: 'notifications',
  ACTIVITY_LOGS: 'activityLogs',
  SETTINGS: 'settings',
} as const;

// ─── Ticket ID Generator ──────────────────────────────────────
export const generateTicketNumber = (sequenceNum: number): string => {
  const year = new Date().getFullYear();
  const padded = String(sequenceNum).padStart(6, '0');
  return `MT-${year}-${padded}`;
};

// ─── Timestamp Helper ─────────────────────────────────────────
export const toISOString = (ts: Timestamp | string | null | undefined): string => {
  if (!ts) return new Date().toISOString();
  if (typeof ts === 'string') return ts;
  return ts.toDate().toISOString();
};

// ─── Users ────────────────────────────────────────────────────
export const getUserById = async (uid: string): Promise<User | null> => {
  const docRef = doc(db, COLLECTIONS.USERS, uid);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as User;
};

export const createUser = async (uid: string, userData: Partial<User>): Promise<void> => {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
    ...userData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }).catch(async () => {
    // Document doesn't exist, create it
    const { setDoc } = await import('firebase/firestore');
    await setDoc(doc(db, COLLECTIONS.USERS, uid), {
      ...userData,
      id: uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
};

export const updateUser = async (uid: string, data: Partial<User>): Promise<void> => {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

// ─── Properties ───────────────────────────────────────────────
export const getProperties = async (managerId?: string): Promise<Property[]> => {
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
  if (managerId) constraints.unshift(where('managerId', '==', managerId));
  const q = query(collection(db, COLLECTIONS.PROPERTIES), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Property));
};

export const createProperty = async (data: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const ref = await addDoc(collection(db, COLLECTIONS.PROPERTIES), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

// ─── Maintenance Tickets ──────────────────────────────────────
export const getTickets = async (filters?: TicketFilters): Promise<MaintenanceTicket[]> => {
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
  if (filters?.status && filters.status !== 'all') {
    constraints.unshift(where('status', '==', filters.status));
  }
  if (filters?.priority && filters.priority !== 'all') {
    constraints.unshift(where('priority', '==', filters.priority));
  }
  if (filters?.propertyId && filters.propertyId !== 'all') {
    constraints.unshift(where('propertyId', '==', filters.propertyId));
  }
  const q = query(collection(db, COLLECTIONS.TICKETS), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as MaintenanceTicket));
};

export const getTicketsByTenant = async (tenantId: string): Promise<MaintenanceTicket[]> => {
  const q = query(
    collection(db, COLLECTIONS.TICKETS),
    where('tenantId', '==', tenantId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as MaintenanceTicket));
};

export const getTicketsByContractor = async (contractorId: string): Promise<MaintenanceTicket[]> => {
  const q = query(
    collection(db, COLLECTIONS.TICKETS),
    where('assignedContractorId', '==', contractorId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as MaintenanceTicket));
};

export const getTicketById = async (ticketId: string): Promise<MaintenanceTicket | null> => {
  const snap = await getDoc(doc(db, COLLECTIONS.TICKETS, ticketId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as MaintenanceTicket;
};

export const createTicket = async (data: Omit<MaintenanceTicket, 'id'>): Promise<string> => {
  const ref = await addDoc(collection(db, COLLECTIONS.TICKETS), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateTicketStatus = async (
  ticketId: string,
  status: TicketStatus,
  additionalData?: Partial<MaintenanceTicket>
): Promise<void> => {
  await updateDoc(doc(db, COLLECTIONS.TICKETS, ticketId), {
    status,
    ...additionalData,
    updatedAt: serverTimestamp(),
  });
};

export const updateTicket = async (ticketId: string, data: Partial<MaintenanceTicket>): Promise<void> => {
  await updateDoc(doc(db, COLLECTIONS.TICKETS, ticketId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

// ─── Subscribe to Tickets (Real-time) ────────────────────────
export const subscribeToTickets = (
  callback: (tickets: MaintenanceTicket[]) => void,
  tenantId?: string,
  contractorId?: string
) => {
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc'), limit(100)];
  if (tenantId) constraints.unshift(where('tenantId', '==', tenantId));
  if (contractorId) constraints.unshift(where('assignedContractorId', '==', contractorId));
  const q = query(collection(db, COLLECTIONS.TICKETS), ...constraints);
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as MaintenanceTicket)));
  });
};

// ─── Messages ─────────────────────────────────────────────────
export const subscribeToMessages = (
  ticketId: string,
  callback: (messages: TicketMessage[]) => void
) => {
  const q = query(
    collection(db, COLLECTIONS.MESSAGES),
    where('ticketId', '==', ticketId),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as TicketMessage)));
  });
};

export const sendMessage = async (data: Omit<TicketMessage, 'id' | 'createdAt'>): Promise<string> => {
  const ref = await addDoc(collection(db, COLLECTIONS.MESSAGES), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

// ─── Notifications ────────────────────────────────────────────
export const subscribeToNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void
) => {
  const q = query(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification)));
  });
};

export const createNotification = async (data: Omit<Notification, 'id' | 'createdAt'>): Promise<void> => {
  await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
    ...data,
    createdAt: serverTimestamp(),
  });
};

export const markNotificationRead = async (notificationId: string): Promise<void> => {
  await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notificationId), { isRead: true });
};

export const markAllNotificationsRead = async (userId: string): Promise<void> => {
  const q = query(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    where('userId', '==', userId),
    where('isRead', '==', false)
  );
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.docs.forEach(d => batch.update(d.ref, { isRead: true }));
  await batch.commit();
};

// ─── Activity Logs ────────────────────────────────────────────
export const createActivityLog = async (data: Omit<ActivityLog, 'id' | 'createdAt'>): Promise<void> => {
  await addDoc(collection(db, COLLECTIONS.ACTIVITY_LOGS), {
    ...data,
    createdAt: serverTimestamp(),
  });
};

export const getActivityLogs = async (ticketId: string): Promise<ActivityLog[]> => {
  const q = query(
    collection(db, COLLECTIONS.ACTIVITY_LOGS),
    where('ticketId', '==', ticketId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ActivityLog));
};

// ─── Contractors ──────────────────────────────────────────────
export const getContractors = async (): Promise<Contractor[]> => {
  const q = query(collection(db, COLLECTIONS.CONTRACTORS), orderBy('companyName', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Contractor));
};

export const createContractor = async (data: Omit<Contractor, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const ref = await addDoc(collection(db, COLLECTIONS.CONTRACTORS), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};
