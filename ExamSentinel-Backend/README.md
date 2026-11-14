# ExamSentinel Backend

> Backend service for **ExamSentinel**, an examination management and security platform designed to support secure online examinations, candidate management, examination administration, monitoring, activity logging, and related institutional workflows.

**Final Year Project — 2026**  
**IPS Academy, Indore — Department of Computer Science and Engineering**

### Authors

- **Arib Khan**
- **Aditya Jaiswal**


---

## Overview

ExamSentinel Backend is the server-side application powering the ExamSentinel examination platform.

It provides REST APIs and WebSocket-based communication for student examinations and administrative operations. The backend handles authentication, examination management, student and institution data, question management, permissions, examination activity logs, seat mapping, notifications, imports/exports, and other supporting workflows.

The backend is implemented as a Node.js application using Express and communicates with MySQL and Redis.

---

## Key Capabilities

The current codebase includes functionality for:

- Student/candidate authentication
- JWT-based access and refresh tokens
- Role-based and object-level permissions
- Institution management
- Examination creation and management
- Student registration and bulk student import
- Question creation and bulk question import
- Examination sets and question shuffling
- Examination instructions
- Student-to-exam mapping
- Centre, hall, room, row and seat management
- Seat-plan arrangement
- Student answer submission and answer logs
- Examination activity/audit logging
- Notifications and OTP-related workflows
- Data import/export
- Excel-based data processing
- File uploads and document/image processing
- Real-time communication through WebSockets
- Redis-backed session/storage functionality
- Biometric/fingerprint-related examination workflows present in the current application

> Features listed above are based on the current repository structure and should be kept in sync with future implementation changes.

---

## Technology Stack

### Runtime & Backend

- Node.js
- Express 5
- JavaScript
- REST APIs
- WebSocket (`ws`)

### Database & Storage

- MySQL
- Redis
- File-system based uploads/storage

### Authentication & Security

- JSON Web Tokens (JWT)
- bcrypt / bcryptjs
- Express sessions
- CORS

### Data & File Processing

- ExcelJS
- XLSX
- PDFKit
- PDF parsing
- Sharp
- Adm-Zip
- Express File Upload

### Build

- esbuild
- Nodemon

---

## Architecture

At a high level, requests follow this flow:

```text
Client / ExamSentinel Frontend
            │
            ▼
       Express Server
            │
     ┌──────┴──────┐
     │             │
 REST APIs      WebSocket
     │             │
     ├─────────────┤
     │             │
     ▼             ▼
   MySQL         Redis
     │
     ▼
Application Data
```

Authentication-protected API routes use JWT verification before reaching protected modules.

---

## Project Structure

```text
ExamSentinel-Backend/
├── config/                 # Database, Redis and authentication configuration
├── models/                 # Database/application models
├── routes/                 # REST API routes
│   ├── utils/              # Authentication and utility modules
│   └── ...
├── sessionTracker/         # Real-time/session tracking
├── uploads/                # Uploaded/imported files
├── build.js                # esbuild configuration
├── index.js                # Express + WebSocket server entry point
├── server.js               # Cluster-related server entry
├── pdfextract.py           # PDF extraction utility
├── package.json
├── .gitignore
└── LICENSE
```

---

## Main API Areas

The backend currently exposes API groups including:

| Area | Base Path |
|---|---|
| Student | `/api/student` |
| Student Seat Plan | `/api/student_seat_plan` |
| Student Extension | `/api/studentext` |
| Centre Seats | `/api/CenterSeat` |
| Users & Roles | `/api/user`, `/api/userRole` |
| Questions | `/api/question` |
| Institutions | `/api/institute` |
| Exams | `/api/exam` |
| Centres | `/api/center` |
| Student-Exam Mapping | `/api/student_exam_map` |
| Permissions | `/api/userpermision`, `/api/systemobj` |
| Student Answers | `/api/studentAnswer` |
| Activity Logs | `/api/activity-log` |
| File Extraction/Upload | `/api/extract` |
| Student Answer Logs | `/api/student_answers_log` |
| Exam Sets | `/api/examset` |
| Export | `/api/export` |
| Download | `/api/download` |
| Notifications | `/api/notification` |
| OTP | `/api/otp` |
| Client Preferences | `/api/client_preferences` |

Authentication endpoints are exposed under:

```text
/auth
```

The root health/status endpoint is:

```text
GET /
```

---

## Prerequisites

Before running the backend locally, install:

- Node.js 20 or a compatible supported Node.js version
- npm
- MySQL
- Redis

You may also need access to the project's required file-processing and local storage directories.

---

## Installation

Clone the repository and install dependencies:

```bash
git clone <YOUR_BACKEND_REPOSITORY_URL>
cd ExamSentinel-Backend
npm install
```

---

## Environment Variables

Create a `.env` file locally.

**Never commit `.env` to Git.**

The current application references environment variables including:

```env
NODE_ENV=development

TOKEN_SECRET=replace_with_a_secure_secret
REFRESH_TOKEN_SECRET=replace_with_a_secure_refresh_secret

REDIS_PATH=<path_to_redis_executable>
REDIS_CONF=<path_to_redis_configuration>

STUDENTS_IMAGE_S=<students_image_storage_path>
UPLOADS_BASE=<uploads_base_path>
EXCEL_UPLOAD_DIR=<excel_upload_directory>
QUESTION_IMAGE_ZIP_DIR=<question_image_zip_directory>
STUDENTS_ZIP_DIR=<students_zip_directory>
TEMP_EXTRACT_DIR=<temporary_extraction_directory>
STUDENTS_IMAGE_DIR=<students_image_directory>
EXCEL_CONFIG_PATH=<excel_configuration_path>
STUDENT_IMAGE_PATH=<student_image_path>
```

Database configuration should also be moved to environment variables before deploying this project publicly. See the **Security Recommendations** section below.

---

## Database

The current backend uses **MySQL**.

Before starting the application:

1. Create the required MySQL database.
2. Import/provision the required schema.
3. Create a database user with appropriate permissions.
4. Configure the backend connection through environment variables.

Do not commit database credentials to the repository.

---

## Redis

Redis is used by the current application for session and real-time related functionality.

Make sure Redis is running and accessible before starting the backend.

The current implementation references:

```text
127.0.0.1:6379
```

and also uses `REDIS_PATH` / `REDIS_CONF` for local Redis startup configuration.

For production deployments, Redis should normally be managed as a separate service rather than being launched directly by the application process.

---

## Running the Backend

### Development

The current `package.json` uses:

```bash
npm start
```

which starts the application through Nodemon.

### Build

Create the bundled production build:

```bash
npm run build
```

The build process uses esbuild and outputs the bundled server under `dist/`.

### Current `dev` Script

The repository currently contains:

```text
npm run dev
```

which starts the generated bundle through PM2.

Verify the PM2 configuration and deployment environment before using this command in production.

---

## WebSocket

ExamSentinel uses WebSockets for real-time examination/session communication.

The backend creates a WebSocket server on the same HTTP server used by Express.

Clients can connect using the configured backend WebSocket URL.

The exact WebSocket URL should be supplied through the frontend environment configuration rather than hard-coded.

---

## Authentication

The backend uses JWT-based authentication.

Protected API routes validate the access token supplied through the HTTP `Authorization` header:

```text
Authorization: Bearer <token>
```

Access and refresh token secrets must be stored securely in environment variables.

---

## Security

Security is particularly important for an examination platform.

Recommended practices include:

- Use strong, randomly generated JWT secrets.
- Never commit `.env` files.
- Never hard-code database passwords.
- Use HTTPS/WSS in production.
- Restrict CORS to trusted frontend origins.
- Use secure session cookies in production.
- Validate and sanitize uploaded files.
- Restrict upload sizes and file types.
- Apply rate limiting to authentication and OTP endpoints.
- Avoid exposing internal error details to clients.
- Rotate credentials that have previously been committed to source control.
- Keep dependencies updated and review security advisories.

---

## Testing

The current repository does not contain a configured automated test suite.

The `npm test` script currently returns a placeholder message.

Recommended future additions:

- API integration tests
- Authentication tests
- Permission/role tests
- Examination workflow tests
- File upload validation tests
- WebSocket tests
- Security regression tests

---

## Related Repository

The ExamSentinel frontend is maintained in a separate repository.

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

Replace the repository placeholder with the actual frontend GitHub URL when the repositories are published.

---

## Contributing

Contributions, improvements, and suggestions are welcome.

Before submitting a change:

1. Create a feature or fix branch.
2. Keep changes focused.
3. Follow the existing project structure.
4. Do not commit secrets or environment files.
5. Test the affected functionality.
6. Submit a clear pull request.

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
