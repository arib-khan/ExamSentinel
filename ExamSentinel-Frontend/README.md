# ExamSentinel Frontend

> Frontend application for **ExamSentinel**, an examination management and security platform designed to support secure online examinations, candidate workflows, administration, monitoring, and examination operations.

**Final Year Project — 2026**  
**IPS Academy, Indore — Department of Computer Science and Engineering**

### Authors

- **Arib Khan**
- **Aditya Jaiswal**

---

## Overview

ExamSentinel Frontend is the web application for the ExamSentinel examination platform.

It provides separate user experiences for examination candidates and administrative/operational users. The application includes secure exam flows, role-based navigation, permission-aware administration, examination management, student management, question management, centre and seat management, live exam activity, reporting, imports/exports, and supporting workflows.

The frontend communicates with the ExamSentinel backend through REST APIs and WebSockets.

---

## Key Capabilities

The current application includes functionality for:

### Candidate / Student

- Candidate login
- Examination instructions
- Protected examination flow
- Full-screen examination mode
- Resume/re-attempt handling
- Auto-save and restoration support
- Tab-switch monitoring
- Full-screen monitoring
- Clipboard restrictions
- Back-navigation protection
- Inactivity monitoring
- DevTools/inspection detection hooks
- Examination result and completion flow
- Examination activity/audit logging

### Administration

- Dashboard
- Institution management
- Examination creation and management
- Student registration
- Bulk student upload
- Question management
- Bulk question upload
- Centre management
- Centre inventory
- Examination scheduling
- Student/exam mapping
- Seat mapping and arrangement
- User management
- Role management
- Object permissions
- System object management
- Notifications
- Activity logs
- Reports
- Data import/export
- Client preferences
- Examination controls

### Operational / Verification Workflows

The current codebase also contains workflows related to:

- Class/invigilator operations
- Live examination details
- Student verification
- Biometric registration
- Biometric verification
- Fingerprint capture
- Student data download
- Question paper download

> This list reflects functionality represented in the current repository. Some modules may require specific backend services or hardware/configuration to operate.

---

## Technology Stack

### Frontend

- React 19
- Vite
- JavaScript / JSX
- React Router
- Redux Toolkit
- React Redux
- React Hook Form
- Yup
- Axios

### UI

- Tailwind CSS
- Radix UI
- Lucide React
- Sonner
- Custom reusable components

### Data & Visualization

- TanStack React Table
- Recharts
- XLSX

### Real-Time

- WebSocket

### Utilities

- date-fns
- react-day-picker
- class-variance-authority
- clsx
- tailwind-merge

### Development

- ESLint
- Vite
- React Fast Refresh

---

## Application Architecture

A simplified view of the frontend architecture:

```text
                 ExamSentinel Frontend
                         │
             ┌───────────┴───────────┐
             │                       │
        Public Routes          Protected Routes
             │                       │
          Login etc.        Role / Permission
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                 Admin           Candidate       Operations
                    │                │                │
                    └────────────────┼────────────────┘
                                     │
                           Services / API Client
                                     │
                           REST API / WebSocket
                                     │
                                     ▼
                         ExamSentinel Backend
```

---

## Project Structure

```text
ExamSentinel-Frontend/
├── public/                       # Public/static assets
├── src/
│   ├── components/               # Reusable UI components
│   ├── constants/                # Application constants/providers
│   ├── contexts/                 # React contexts
│   ├── features/                 # Feature-specific application modules
│   ├── hooks/                    # Reusable hooks and exam monitoring hooks
│   ├── routes/                   # Public, protected and role-based routes
│   ├── services/                 # API/service integrations
│   ├── store/                    # Redux store and slices
│   ├── pages/                    # Application pages
│   ├── App.jsx                   # Main application routing
│   └── main.jsx                  # Application entry point
├── index.html
├── vite.config.js
├── package.json
├── .gitignore
└── LICENSE
```

---

## Exam Security / Monitoring Hooks

The current frontend contains several examination security and monitoring mechanisms, including hooks for:

- Anti-cheating monitoring
- Tab-switch detection
- Full-screen monitoring
- Clipboard blocking
- Back-navigation prevention
- Preventing accidental page unload
- User inactivity detection
- DevTools detection
- Inspection/interaction restrictions
- Exam environment monitoring
- Login and examination audit logging

These mechanisms should be considered **defense-in-depth controls**, not a guarantee that cheating or circumvention is impossible.

---

## Prerequisites

Install:

- Node.js
- npm

A current Node.js LTS release is recommended.

---

## Installation

Clone the repository:

```bash
git clone <YOUR_FRONTEND_REPOSITORY_URL>
cd ExamSentinel-Frontend
```

Install dependencies:

```bash
npm install
```

---

## Environment Variables

Create a local `.env` file.

The application currently uses variables including:

```env
VITE_API_BASE_URL=http://localhost:3001/
VITE_WEB_SOCKET_URL=ws://localhost:3001
VITE_API_CLOUD_URL=<your_api_or_storage_service_url>
VITE_SOCKET_URL=<your_socket_url>
```

Use the correct values for your environment.

**Never commit `.env` or production secrets.**

The repository's `.gitignore` should keep environment files out of source control.

For a public repository, provide a safe `.env.example` containing placeholders only.

---

## Backend Connection

The frontend communicates with the ExamSentinel backend through:

### REST API

```text
VITE_API_BASE_URL
```

### WebSocket

```text
VITE_WEB_SOCKET_URL
```

The actual URLs depend on the development or production deployment.

Do not hard-code private IP addresses or production infrastructure URLs into source code.

---

## Running Locally

Start the Vite development server:

```bash
npm run dev
```

Vite will display the local development URL in the terminal.

---

## Production Build

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## Linting

Run ESLint:

```bash
npm run lint
```

Fix lint issues before submitting significant changes where practical.

---

## Routing and Access Control

The application separates routes into several categories:

- Public routes
- Protected exam routes
- Role-based administrative routes
- Permission-protected routes

The current application uses role-based route configuration together with permission checks to control access to administrative modules.

---

## State Management

Redux Toolkit is used for centralized application state.

The current store contains major state areas including:

```text
auth
exam
ui
```

Additional state may be managed through React Context and feature-specific hooks.

---

## API Services

The frontend organizes API communication into service modules for areas such as:

- Authentication
- Students
- Institutions
- Centres
- Exams
- Questions
- Results
- Mapping
- Permissions
- Notifications
- Dashboard/live activity
- Administrative controls

This separation keeps API communication independent from most UI components.

---

## Documentation

Additional project documentation currently exists in the repository, including:

- `Project_Functionality_docs.md`
- `UI_Docs.md`

These documents can be expanded as the system evolves.

For long-term maintainability, consider moving detailed documentation into a dedicated `docs/` directory.

---

## Related Repository

The backend is maintained separately.

```text
ExamSentinel Frontend
        │
        │ REST API / WebSocket
        ▼
ExamSentinel Backend
        │
   ┌────┴────┐
   ▼         ▼
 MySQL     Redis
```

Replace the backend repository placeholder with the actual GitHub URL when the repositories are published.

---

## Contributing

Contributions, bug reports, and improvements are welcome.

Before submitting a change:

1. Create a feature or fix branch.
2. Keep changes focused.
3. Follow the existing component/service structure.
4. Do not commit environment files or secrets.
5. Run the build and lint checks.
6. Clearly describe the changes in the pull request.

See `CONTRIBUTING.md` for additional guidelines if present.

---

## License

This project is released under the **MIT License**.

Copyright © 2026 **Arib Khan and Aditya Jaiswal**.

---

## Academic Project

**ExamSentinel**  
AI-Powered Intelligent Examination Security System

**Final Year Project — 2026**

IPS Academy, Indore  
Department of Computer Science and Engineering