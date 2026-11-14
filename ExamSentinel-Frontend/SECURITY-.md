# Security Policy — ExamSentinel Frontend

## Overview

The **ExamSentinel Frontend** is the web application for the ExamSentinel examination security system.

The frontend contains authentication flows, examination interfaces, administrative functionality, permissions, candidate workflows, monitoring features, and communication with the ExamSentinel Backend.

Security is particularly important because the application may display or transmit student and examination-related information.

This policy explains how to report security vulnerabilities and how contributors should handle sensitive information.

## Supported Versions

ExamSentinel is currently maintained as a Final Year Project.

| Version | Supported |
| --- | --- |
| Current development version | Yes |
| Older/unmaintained versions | No |

Once formal releases are introduced, this table should be updated with specific supported versions.

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues, pull requests, discussions, or other public channels.**

A vulnerability report may expose sensitive information and make the system easier to attack.

Instead, report the issue privately using the security contact method configured by the repository maintainers.

> **Security contact:** `[Configure a private security contact here]`

Do not invent or publish a personal email address until an official reporting channel has been configured.

### Include in a Report

Where possible, provide:

- A clear description of the vulnerability.
- The affected page, component, route, or feature.
- Steps required to reproduce the issue.
- The potential security impact.
- Relevant browser/network information with secrets removed.
- A suggested mitigation, if known.
- Whether the issue affects confidentiality, integrity, or availability.

Do not include real passwords, API keys, tokens, student records, biometric information, examination data, or other sensitive information in the report.

## What Should Be Reported Privately?

Please report issues such as:

- Authentication bypass.
- Authorization or permission bypass.
- Token/session vulnerabilities.
- Cross-site scripting.
- Sensitive information disclosure.
- Insecure API usage.
- Insecure WebSocket communication.
- Client-side mechanisms that unintentionally expose protected functionality.
- Examination-security bypasses.
- Vulnerabilities that expose student or examination information.
- Hard-coded secrets.
- Production endpoint or credential exposure.
- Dependency vulnerabilities with a realistic security impact.

## Sensitive Data

Never commit or publicly expose:

- `.env` files.
- API keys.
- Authentication tokens.
- Backend credentials.
- Private keys.
- Production configuration containing secrets.
- Student personal information.
- Student images or documents.
- Biometric/fingerprint data.
- Examination records.
- Question papers or restricted examination material.
- Screenshots containing sensitive information.
- Production API responses containing personal data.

Remember that frontend environment variables prefixed with `VITE_` are generally bundled into the client application and should **not** contain secrets.

## If a Secret Is Accidentally Committed

If you accidentally commit a password, token, API key, or other credential:

1. Treat the credential as compromised immediately.
2. Rotate or revoke it.
3. Remove it from the working tree.
4. Check Git history and remove it from history when appropriate.
5. Notify the repository maintainers privately.
6. Do not publish the secret in an issue, pull request, commit message, or chat.

Removing a secret from the latest commit alone does not necessarily remove it from Git history.

## Frontend Security Guidelines

Contributors should:

- Never put secrets in frontend source code.
- Never assume client-side route protection is sufficient security.
- Treat all API responses as untrusted data.
- Avoid unsafe HTML rendering.
- Validate user input where appropriate.
- Use HTTPS in production.
- Use secure WebSocket connections (`wss://`) in production.
- Avoid exposing internal API or infrastructure details unnecessarily.
- Handle authentication tokens according to the application's established security architecture.
- Avoid storing sensitive information unnecessarily in browser storage.
- Keep dependencies reasonably up to date.
- Review security implications before adding third-party packages.

## Authentication and Authorization

The frontend contains protected routes and permission-aware interfaces.

Frontend checks improve user experience but must not be treated as the final authorization boundary.

The backend must independently enforce authentication and authorization.

Contributors should not:

- Remove protected-route checks without a clear reason.
- Hide security problems by only changing UI behavior.
- Add administrative controls without corresponding backend authorization.
- Expose privileged API functionality to unauthorized users.

## Examination Security

ExamSentinel contains examination-security and monitoring features.

Security-sensitive changes affecting:

- Full-screen behavior.
- Tab-switch detection.
- Clipboard restrictions.
- Back-navigation protection.
- Inactivity detection.
- DevTools/inspection detection.
- Examination timers.
- Exam submission.
- Candidate verification.
- Activity logging.
- Protected examination routes.

should receive additional review.

These client-side mechanisms should be treated as defense-in-depth controls. They must not be presented as a replacement for server-side authorization and examination security.

## API and WebSocket Security

The frontend communicates with the ExamSentinel Backend.

Contributors should:

- Use configured API URLs instead of hard-coding production endpoints.
- Avoid exposing credentials in requests or logs.
- Handle authentication failures safely.
- Avoid displaying sensitive server errors directly to users.
- Use `wss://` for production WebSocket connections.
- Ensure sensitive information is not unnecessarily persisted in browser storage.

## Dependency Security

Before adding or updating a dependency:

- Verify its purpose.
- Review its license.
- Check for known vulnerabilities.
- Avoid unnecessary packages.
- Prefer well-maintained dependencies.
- Keep the package lockfile consistent.

## Disclosure Process

After a valid vulnerability is reported privately, maintainers should:

1. Confirm receipt of the report.
2. Assess severity and affected components.
3. Reproduce the issue where possible.
4. Develop and test a fix.
5. Rotate compromised credentials if required.
6. Release the fix where appropriate.
7. Communicate the resolution to the reporter when possible.
8. Publicly disclose details only when it is safe and appropriate.

## Security Best Practices for Deployment

Production frontend deployments should use:

- HTTPS.
- Secure API endpoints.
- Secure WebSocket connections.
- Proper Content Security Policy where practical.
- Restricted backend CORS configuration.
- No secrets in Vite/client environment variables.
- Secure handling of authentication state.
- Regular dependency updates.
- Appropriate browser security headers.
- No production student/examination data stored in the repository.

## Scope

This policy applies to the ExamSentinel Frontend repository and its related client-side application code and configuration.

## Project Information

**Project:** ExamSentinel  
**Authors:** Arib Khan and Aditya Jaiswal  
**Institution:** IPS Academy, Indore  
**Department:** Computer Science and Engineering  
**Project:** Final Year Project — 2026

## License

ExamSentinel is released under the **MIT License**.

Copyright © 2026 **Arib Khan and Aditya Jaiswal**.
