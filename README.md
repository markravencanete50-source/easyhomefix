# House of Lettings Fix — Property Maintenance Management Platform

> *Every issue. Tracked. Resolved.*

A production-ready, full-featured property maintenance management web application built with React, TypeScript, Firebase, and deployed via GitHub + Vercel.

---

## Features

### Multi-Role System
- **Tenant** — Submit maintenance requests, track status, communicate with managers
- **Property Manager** — Full ticket management, contractor assignment, analytics dashboard
- **Contractor** — View assigned jobs, update progress, upload completion evidence
- **Admin** — User management, audit logs, system configuration

### Core Capabilities
- Multi-step maintenance request submission with photo/video uploads
- Real-time ticket status tracking with workflow engine
- Priority system: Emergency → High → Medium → Low
- Ticket-based messaging between all parties
- Push notifications (Firebase FCM)
- Analytics dashboard with charts (Recharts)
- Contractor assignment and scheduling
- Activity audit logs
- Firebase Storage for file attachments
- Demo mode with mock data (no Firebase required)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| UI | Tailwind CSS 4 + Shadcn/UI + Radix UI |
| Auth | Firebase Authentication |
| Database | Firebase Firestore |
| Storage | Firebase Storage |
| Notifications | Firebase Cloud Messaging (FCM) |
| Charts | Recharts |
| Routing | Wouter |
| Forms | React Hook Form + Zod |
| Hosting | Vercel |
| Source | GitHub |

---

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server (Demo Mode — no Firebase needed)
pnpm dev
```

Visit `http://localhost:3000` and click any demo role button to explore.

For full Firebase integration, see [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## Project Structure

```
client/src/
├── pages/
│   ├── Login.tsx                    # Auth page with demo login
│   ├── Messages.tsx                 # Ticket-based messaging center
│   ├── tenant/
│   │   ├── TenantDashboard.tsx      # Tenant home with active tickets
│   │   ├── TenantRequests.tsx       # All tenant requests list
│   │   └── ReportIssue.tsx          # Multi-step request form
│   ├── manager/
│   │   ├── ManagerDashboard.tsx     # Analytics + metrics overview
│   │   ├── AllTickets.tsx           # Full ticket management table
│   │   └── Contractors.tsx          # Contractor directory + assignment
│   ├── contractor/
│   │   └── ContractorDashboard.tsx  # Job list + completion workflow
│   └── admin/
│       └── AdminDashboard.tsx       # User management + audit logs
├── components/
│   ├── DashboardLayout.tsx          # Shared sidebar + header layout
│   ├── NotificationPanel.tsx        # Slide-out notification panel
│   └── ui/                          # Shadcn/UI components
├── contexts/
│   ├── AuthContext.tsx              # Firebase auth + demo mode
│   └── ThemeContext.tsx             # Light/dark theme
├── lib/
│   ├── firebase.ts                  # Firebase initialization
│   ├── firestore.ts                 # Firestore CRUD helpers
│   ├── storage.ts                   # Firebase Storage helpers
│   ├── mockData.ts                  # Demo mode seed data
│   └── utils.ts                     # Formatters, constants, helpers
└── types/
    └── index.ts                     # All TypeScript interfaces
```

---

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Tenant | `tenant@demo.com` | `demo1234` |
| Property Manager | `manager@demo.com` | `demo1234` |
| Contractor | `contractor@demo.com` | `demo1234` |
| Admin | `admin@demo.com` | `demo1234` |

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the complete step-by-step guide covering:
1. Firebase project setup (Auth, Firestore, Storage)
2. Security rules deployment
3. GitHub repository setup
4. Vercel deployment with environment variables
5. First admin user creation
6. Optional: Firebase Emulator + GitHub Actions CI/CD

---

## License

MIT
