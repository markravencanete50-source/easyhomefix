# Property Maintenance Management Platform — Design Brainstorm

## Three Stylistic Approaches

### Option A: Industrial Command Center
A rugged, utilitarian aesthetic inspired by industrial facility management software and field operations tools. Dark steel tones, amber alerts, monospaced data readouts.
**Probability:** 0.04

### Option B: Clean Civic Infrastructure
A crisp, government-grade professional aesthetic — neutral whites, deep navy, structured data tables, clear hierarchy. Inspired by modern municipal services portals and enterprise SaaS tools.
**Probability:** 0.07

### Option C: Modern Operations Dashboard (SELECTED)
A sophisticated, high-contrast operational platform with a dark sidebar, warm off-white content area, and a bold teal/slate accent system. Inspired by modern DevOps and field-service management tools. Feels authoritative yet approachable.
**Probability:** 0.03

---

## Selected Approach: Modern Operations Dashboard

### Design Movement
**Operational SaaS / Field Service Management** — the aesthetic language of tools like Linear, Incident.io, and ServiceNow's modern redesign. Structured, purposeful, and built for power users who need to act fast.

### Core Principles
1. **Information density with breathing room** — pack data meaningfully without crowding; use consistent 8px grid spacing
2. **Status-first hierarchy** — color-coded status badges, priority flags, and urgency indicators are always the first thing the eye finds
3. **Role-aware clarity** — each role (Tenant, Manager, Contractor, Admin) sees a tailored, uncluttered interface
4. **Motion with purpose** — transitions confirm state changes, not decorate them

### Color Philosophy
A dark slate sidebar anchors the interface with authority. The content area uses a warm off-white (not pure white) to reduce eye strain during long sessions. Teal (`#0D9488`) serves as the primary action color — energetic but professional. Amber signals warnings; red signals emergencies. Status colors are semantic and consistent across all roles.

- Background: `oklch(0.97 0.005 80)` — warm off-white
- Sidebar: `oklch(0.14 0.015 240)` — deep slate-navy
- Primary: `oklch(0.58 0.14 185)` — teal
- Warning: `oklch(0.75 0.15 70)` — amber
- Destructive: `oklch(0.58 0.22 25)` — red
- Muted text: `oklch(0.52 0.01 240)`

### Layout Paradigm
**Persistent left sidebar + scrollable content panel.** The sidebar contains role-specific navigation with icon + label pairs. Content area uses a header bar with breadcrumbs + actions, followed by a main content zone. No centered hero layouts — this is a tool, not a marketing site. Mobile collapses to a bottom nav or slide-out drawer.

### Signature Elements
1. **Status pill badges** — rounded, color-filled pills for ticket status (Submitted, Under Review, Assigned, In Progress, Completed, Closed) — consistent across all views
2. **Priority flag chips** — left-border-accented chips (Emergency=red, High=amber, Medium=blue, Low=slate) on ticket cards and table rows
3. **Step progress indicator** — a horizontal stepper with numbered circles for the multi-step maintenance submission form

### Interaction Philosophy
Every action has immediate visual feedback. Status changes animate smoothly. Form steps slide in from the right. Modals scale from 0.95 opacity. Hover states on table rows use a subtle left-border highlight. Destructive actions require confirmation dialogs.

### Animation
- Sidebar collapse: 200ms ease-out width transition
- Page transitions: 150ms fade + 8px slide-up
- Modal open: 200ms scale(0.95→1) + opacity(0→1)
- Toast notifications: slide in from top-right, 180ms
- Status badge changes: 120ms color crossfade
- Button press: scale(0.97) 160ms ease-out

### Typography System
- **Display / Headings**: `DM Sans` — geometric, modern, slightly rounded. Used for dashboard titles, ticket numbers, section headers.
- **Body / UI**: `Inter` — highly legible at small sizes for table data, labels, descriptions.
- **Monospace**: `JetBrains Mono` — ticket IDs (MT-2024-000001), timestamps, code-like data.
- Hierarchy: 32px display → 24px h1 → 20px h2 → 16px h3 → 14px body → 12px caption

### Brand Essence
**"FixFlow — The maintenance workflow platform built for property teams who move fast."**
Personality: **Reliable. Decisive. Clear.**

### Brand Voice
Headlines are direct and action-oriented. CTAs use verbs. No filler.
- Example headline: *"Every issue. Tracked. Resolved."*
- Example CTA: *"Report an Issue"* / *"Assign Contractor"* / *"View All Tickets"*
- Banned phrases: "Welcome to our platform", "Get started today", "Streamline your workflow"

### Wordmark & Logo
A bold wrench-and-checkmark fusion mark — a stylized wrench where the handle forms a checkmark. Single color, works on dark and light backgrounds. Used in sidebar header at 32px.

### Signature Brand Color
**Teal `#0D9488`** — the action color. Appears on primary buttons, active nav items, progress indicators, and the "In Progress" status badge.
