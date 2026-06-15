# House of Lettings Fix — Project TODO

## Phase 2: Foundation
- [x] Design system: dark sidebar, teal accent, status badge colors in index.css
- [x] Database schema: users (with roles), properties, units, tickets, ticket_comments, notifications, ticket_photos
- [x] Core DashboardLayout adapted for role-based sidebar navigation
- [x] Google Fonts (Inter) added to index.html

## Phase 3: Auth & Role Dashboards
- [x] Role-based auth: extend user table with role enum (tenant, manager, contractor, admin)
- [x] Role-based routing in App.tsx — redirect to correct dashboard based on role
- [x] Tenant dashboard: my tickets summary, quick submit CTA, recent notifications
- [x] Property Manager dashboard: ticket overview stats, pending assignments, recent activity
- [x] Contractor dashboard: assigned jobs list, in-progress jobs, completion stats
- [x] Admin dashboard: user count, ticket stats, system overview analytics

## Phase 4: Ticket Workflow
- [x] Tenant: multi-step ticket submission form (category, description, priority, photo upload)
- [x] Ticket status workflow: Submitted → Under Review → Assigned → In Progress → Completed → Closed
- [x] Status badge components with color coding
- [x] Priority badge components (Emergency, High, Medium, Low)
- [x] Property Manager: ticket list view with filters and search
- [x] Property Manager: assign ticket to contractor
- [x] Property Manager: update ticket status and add internal notes
- [x] Contractor: view assigned jobs with status
- [x] Contractor: update job progress/status
- [x] Contractor: upload completion photos

## Phase 5: Messaging, Notifications, Properties, Admin
- [x] Threaded per-ticket comments/messaging (Tenant + Manager + Contractor)
- [x] In-app notification system with role-appropriate alerts
- [x] Notification triggers: ticket updates, new assignments, status changes, new comments
- [x] Properties management module: list properties with units
- [x] Units linked to tenants and their tickets
- [x] Photo upload: secure storage via S3, display in ticket detail
- [x] Admin: full user management (view all, assign/change roles)
- [x] Admin: system-wide ticket overview
- [x] Admin: analytics summary (charts)
- [x] Email alert stubs (notification system for status changes, assignments, comments)

## Phase 6: Polish & Delivery
- [x] Responsive mobile layout verified
- [x] Loading states and empty states throughout
- [x] Vitest unit tests (17 tests passing)
- [x] Checkpoint saved
