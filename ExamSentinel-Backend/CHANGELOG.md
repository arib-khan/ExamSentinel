# Changelog

All notable changes to the **ExamSentinel Backend** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project follows Semantic Versioning where formal releases are introduced.

---

## [Unreleased]

### Added

- Ongoing backend improvements and documentation updates.
- Continued development of examination management and security workflows.

### Changed

- Documentation and repository structure are being prepared for public project release.
- Project identity standardized under the **ExamSentinel** name.

### Fixed

- No specific fixes recorded for this unreleased version.

### Security

- Security documentation and repository security practices are being established.
- Sensitive configuration should be provided through environment variables rather than committed source files.

---

## [Initial 2026 Release]

### Added

- Initial ExamSentinel backend application.
- REST API infrastructure using Node.js and Express.
- WebSocket support for real-time application communication.
- Authentication and token-based access control.
- Role and permission management.
- Student and institution management.
- Examination creation and management workflows.
- Examination set and question management.
- Student-to-examination mapping.
- Centre, hall, room, row, and seat management.
- Examination seat-plan functionality.
- Student answer submission and answer logging.
- Examination activity and audit logging.
- Notification and OTP-related functionality.
- Data import and export workflows.
- Excel and document processing.
- File upload and extraction functionality.
- MySQL database integration.
- Redis integration for supporting session and real-time functionality.
- Backend services supporting the ExamSentinel frontend application.

### Changed

- Existing backend functionality consolidated under the **ExamSentinel** project identity.
- Project documentation prepared for the 2026 Final Year Project.

### Fixed

- No historical fixes are recorded in this initial changelog entry.

### Security

- Authentication and authorization mechanisms included in the backend.
- Security-sensitive configuration intended to be supplied through environment variables.
- Security policy added for responsible vulnerability reporting.

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

[Unreleased]: https://github.com/<your-account>/<your-backend-repository>/compare/HEAD...main
