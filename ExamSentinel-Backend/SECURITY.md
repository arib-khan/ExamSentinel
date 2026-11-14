# Security Policy — ExamSentinel Backend

## Overview

The **ExamSentinel Backend** provides server-side APIs and services for the ExamSentinel examination security system.

Because the backend handles authentication, examination workflows, student-related information, permissions, uploaded files, and other potentially sensitive data, security is a core project requirement.

This security policy explains how to report security vulnerabilities and how contributors should handle sensitive information.

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
- The affected component, endpoint, or file.
- Steps required to reproduce the issue.
- The potential security impact.
- Relevant request/response information with secrets removed.
- A suggested mitigation, if known.
- Whether the issue affects confidentiality, integrity, or availability.

Do not include real passwords, API keys, JWT secrets, database credentials, student records, biometric information, or other sensitive data in the report.

## What Should Be Reported Privately?

Please report issues such as:

- Authentication bypass.
- Authorization or permission bypass.
- JWT/token vulnerabilities.
- Session-management vulnerabilities.
- SQL injection.
- Command injection.
- Cross-site scripting.
- Server-side request forgery.
- Path traversal.
- Arbitrary file upload or file execution.
- Insecure file handling.
- Sensitive information disclosure.
- Database credential exposure.
- Hard-coded secrets.
- Insecure WebSocket behavior.
- Examination-security bypasses.
- Vulnerabilities that expose student or examination information.
- Denial-of-service vulnerabilities.
- Dependency vulnerabilities with a realistic security impact.

## Sensitive Data

Never commit or publicly expose:

- `.env` files.
- Database usernames or passwords.
- JWT secrets.
- API keys.
- Access tokens.
- Private keys.
- Redis credentials.
- Production configuration containing secrets.
- Student personal information.
- Student images or documents.
- Biometric/fingerprint data.
- Examination records.
- Question papers or restricted examination material.
- Production database exports.
- Internal infrastructure credentials.

Use environment variables and secure secret-management mechanisms instead.

## If a Secret Is Accidentally Committed

If you accidentally commit a password, token, API key, or other credential:

1. Treat the credential as compromised immediately.
2. Rotate or revoke it.
3. Remove it from the working tree.
4. Check Git history and remove it from history when appropriate.
5. Notify the repository maintainers privately.
6. Do not publish the secret in an issue, pull request, commit message, or chat.

Removing a secret from the latest commit alone does not necessarily remove it from Git history.

## Backend Security Guidelines

Contributors should:

- Validate all untrusted input.
- Use parameterized database queries.
- Enforce authentication on protected endpoints.
- Enforce authorization server-side.
- Validate uploaded files and file sizes.
- Restrict CORS to trusted origins in production.
- Use HTTPS in production.
- Use secure WebSocket connections (`wss://`) in production.
- Store secrets outside source control.
- Avoid logging passwords, tokens, or sensitive student information.
- Return safe error messages without exposing internal implementation details.
- Apply rate limiting to authentication and OTP-related endpoints.
- Keep dependencies reasonably up to date.
- Review security implications before adding new external services or dependencies.

## Authentication and Authorization

Authentication and authorization must be enforced by the backend and must not rely solely on frontend checks.

When adding a protected endpoint:

- Verify the user's authentication.
- Verify the user's role/permissions.
- Verify access to the specific resource where applicable.
- Avoid trusting identifiers supplied by the client without authorization checks.

Never disable authentication or authorization in production to simplify testing.

## File Upload Security

ExamSentinel supports file and document-related workflows.

Uploaded files should be treated as untrusted input.

Contributors should:

- Restrict accepted file types.
- Restrict file sizes.
- Validate file contents where appropriate.
- Store uploads outside executable application paths when practical.
- Generate safe server-side filenames.
- Prevent path traversal.
- Avoid trusting user-supplied filenames.
- Ensure sensitive uploaded files are not publicly accessible.
- Avoid committing uploaded production data to Git.

## Examination Security

ExamSentinel is designed for examination-related workflows.

Security-sensitive changes affecting examination sessions, answers, activity logs, candidate verification, permissions, or monitoring should receive additional review.

Do not intentionally introduce mechanisms that allow candidates or unauthorized users to bypass examination controls.

## Dependency Security

Before adding or updating a dependency:

- Verify that it is actively maintained where practical.
- Review its license.
- Check for known vulnerabilities.
- Avoid unnecessary dependencies.
- Keep dependency changes focused.

Use the project's package manager and lockfile consistently.

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

Production deployments should use:

- HTTPS.
- Secure environment/secret management.
- Restricted database access.
- Restricted Redis access.
- Firewall/network controls.
- Strong authentication secrets.
- Appropriate CORS configuration.
- Regular dependency updates.
- Database backups and recovery procedures.
- Monitoring and logging without sensitive-data leakage.

## Scope

This policy applies to the ExamSentinel Backend repository and its related server-side services and configuration.

## Project Information

**Project:** ExamSentinel  
**Authors:** Arib Khan and Aditya Jaiswal  
**Institution:** IPS Academy, Indore  
**Department:** Computer Science and Engineering  
**Project:** Final Year Project — 2026

## License

ExamSentinel is released under the **MIT License**.

Copyright © 2026 **Arib Khan and Aditya Jaiswal**.
