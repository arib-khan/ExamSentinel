# Contributing to ExamSentinel Backend

Thank you for your interest in contributing to **ExamSentinel Backend**.

ExamSentinel is a Final Year Project developed by **Arib Khan** and **Aditya Jaiswal** at **IPS Academy, Indore, Department of Computer Science and Engineering**.

This repository contains the server-side services, APIs, authentication, examination workflows, data management, and supporting backend functionality for ExamSentinel.

## Before You Start

Please:

- Read this document before making changes.
- Check existing issues and pull requests before starting duplicate work.
- Keep changes focused and avoid unrelated refactoring.
- Never commit passwords, API keys, JWT secrets, database credentials, `.env` files, student data, biometric data, examination records, or other sensitive information.
- Do not introduce breaking changes without clearly documenting them.

## Getting the Repository

Fork the repository on GitHub, then clone your fork:

```bash
git clone <YOUR_FORK_URL>
cd ExamSentinel-Backend
npm install
```

Configure your local environment using the project's `.env.example` file if available.

Never commit your local `.env` file.

## Branching

Create a dedicated branch for each change.

Recommended naming:

```text
feature/<short-description>
fix/<short-description>
docs/<short-description>
refactor/<short-description>
chore/<short-description>
```

Examples:

```text
feature/exam-monitoring-api
fix/student-authentication
docs/update-api-documentation
refactor/question-service
```

Avoid making unrelated changes in the same branch.

## Development Guidelines

When working on the backend:

- Follow the existing project structure and coding patterns.
- Keep route, controller/service, model, and utility responsibilities separated where the existing architecture supports this.
- Reuse existing utilities instead of creating duplicate implementations.
- Validate input at API boundaries.
- Handle errors consistently.
- Avoid exposing internal errors, credentials, or sensitive information in API responses.
- Consider authentication and authorization requirements for every new endpoint.
- Preserve existing API behavior unless a breaking change is intentional and documented.
- Validate uploaded files and avoid accepting unnecessary file types or sizes.
- Do not store sensitive examination or student information in logs.
- Keep database queries efficient and parameterized.
- Do not add dependencies without a clear reason.

## API Changes

For new or modified endpoints, document:

- HTTP method
- Endpoint
- Authentication requirements
- Request parameters/body
- Response format
- Error behavior

Update the relevant README/API documentation when an API change affects users or frontend integration.

If an API change requires a corresponding frontend change, mention it clearly in the pull request.

## Database Changes

Before changing database-related code:

- Understand the existing schema and dependencies.
- Avoid destructive changes unless absolutely necessary.
- Document required schema changes.
- Do not commit production database credentials.
- Test the affected database operations locally.

If a migration system is introduced later, migrations should be reviewed carefully before merging.

## Authentication and Security

Security is especially important for ExamSentinel.

Any authentication, authorization, session, exam-monitoring, file-upload, or student-data change should receive additional review.

Never:

- Hard-code secrets.
- Commit credentials.
- Log passwords or tokens.
- Expose sensitive student information.
- Disable authentication or authorization simply to make development easier.
- Trust client-side permission checks as the only security control.

Report suspected vulnerabilities privately according to `SECURITY.md`.

## Commit Messages

Use concise, descriptive commit messages.

Recommended format:

```text
<type>: <short description>
```

Examples:

```text
feat: add examination monitoring endpoint
fix: resolve student authentication issue
docs: update API documentation
refactor: simplify exam service
chore: update dependencies
test: add exam submission tests
```

Keep commits focused and avoid messages such as:

```text
update
changes
final
working
stuff
```

## Testing and Verification

Before opening a pull request:

- Install dependencies successfully.
- Start the backend successfully.
- Test affected API endpoints.
- Verify authentication/authorization behavior where relevant.
- Verify database interactions where relevant.
- Run available linting/build/test commands.
- Confirm that no secrets or sensitive files are included.

If the repository does not currently contain automated tests for the affected functionality, manually verify the relevant workflow and explain this in the pull request.

## Pull Requests

Create a pull request from your feature/fix branch into the appropriate default branch.

A good pull request should include:

### Description

Explain:

- What changed?
- Why was it changed?
- Which backend functionality is affected?

### Testing

Explain:

- What commands were run?
- What was tested manually?
- Are there known limitations?

### Security

Confirm that:

- No secrets were committed.
- No real student/examination data was added.
- Authentication and authorization were considered.

### Breaking Changes

Clearly identify any breaking API, database, or configuration changes.

## Pull Request Checklist

Before submitting:

- [ ] The change is focused and necessary.
- [ ] Existing functionality has been preserved.
- [ ] Code follows the existing project conventions.
- [ ] Relevant API documentation has been updated.
- [ ] Tests or appropriate manual verification have been performed.
- [ ] No `.env` files or secrets are included.
- [ ] No real student, biometric, or examination data is included.
- [ ] Database changes are documented if applicable.
- [ ] Breaking changes are clearly identified.
- [ ] The README is updated if setup or usage has changed.

## Reporting Bugs

When reporting a bug, include:

- A clear description.
- Steps to reproduce.
- Expected behavior.
- Actual behavior.
- Relevant endpoint/module.
- Environment information.
- Relevant logs or error messages with secrets removed.

Never include passwords, tokens, database credentials, or private student information in an issue.

## Feature Requests

For a feature request, explain:

- The problem being solved.
- The proposed behavior.
- Why it would benefit ExamSentinel.
- Any API/database implications.
- Whether a frontend change would also be required.

## Code Review

Reviewers may request changes related to:

- Correctness
- Security
- API consistency
- Performance
- Maintainability
- Error handling
- Documentation
- Testing

Please address review feedback before merging.

## Scope

Contributions should remain relevant to the ExamSentinel backend.

Avoid unrelated rewrites, framework migrations, dependency upgrades, or architectural changes unless they are discussed and approved first.

## License

By contributing, you agree that your contributions will be made available under the project's **MIT License**.

Copyright © 2026 **Arib Khan and Aditya Jaiswal**.

---

Thank you for helping improve **ExamSentinel Backend**.
