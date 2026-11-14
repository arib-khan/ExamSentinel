# Changelog

All notable changes to the **ExamSentinel Frontend** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project follows Semantic Versioning where formal releases are introduced.

---

## [Unreleased]

### Added

- Ongoing frontend improvements and documentation updates.
- Continued development of examination, administration, and security workflows.

### Changed

- Documentation and repository structure are being prepared for public project release.
- Project identity standardized under the **ExamSentinel** name.

### Fixed

- No specific fixes recorded for this unreleased version.

### Security

- Security documentation and repository security practices are being established.
- Frontend environment variables should contain configuration only and must never contain secrets.

---

## [Initial 2026 Release]

### Added

- Initial ExamSentinel web application.
- React-based frontend application using Vite.
- Authentication and protected application routes.
- Role-based and permission-aware navigation.
- Student/candidate examination workflows.
- Examination instructions and protected examination interface.
- Examination timer and submission workflows.
- Examination activity and monitoring functionality.
- Full-screen and tab-switch monitoring mechanisms.
- Clipboard and navigation restrictions.
- Inactivity and inspection/DevTools detection hooks.
- Administration dashboard.
- Institution management.
- Examination management.
- Student management and bulk data workflows.
- Question management and question import functionality.
- Examination centre and seat management.
- Student-to-examination mapping.
- User, role, and permission management.
- Notifications and administrative controls.
- Reports and data export functionality.
- Real-time communication with the backend through WebSockets.
- REST API integration with the ExamSentinel backend.
- Redux Toolkit-based application state management.
- Responsive UI components and reusable interface elements.

### Changed

- Existing frontend functionality consolidated under the **ExamSentinel** project identity.
- Project documentation prepared for the 2026 Final Year Project.

### Fixed

- No historical fixes are recorded in this initial changelog entry.

### Security

- Protected routes and permission-aware frontend workflows included.
- Examination monitoring and security controls included as defense-in-depth mechanisms.
- Security policy added for responsible vulnerability reporting.
- Sensitive configuration intended to be supplied through environment variables.

---

## Notes

This changelog intentionally avoids inventing historical release information. Future entries should be added as actual changes are made.

When a formal version is released, use a version heading such as:

```text
## [1.0.0] - YYYY-MM-DD
```

and categorize changes under:

- Added
- Changed
- Deprecated
- Removed
- Fixed
- Security

[Unreleased]: https://github.com/<your-account>/<your-frontend-repository>/compare/HEAD...main
