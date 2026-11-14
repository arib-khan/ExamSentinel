# Contributing to ExamSentinel Frontend

Thank you for your interest in contributing to **ExamSentinel Frontend**.

ExamSentinel is a Final Year Project developed by **Arib Khan** and **Aditya Jaiswal** at **IPS Academy, Indore, Department of Computer Science and Engineering**.

This repository contains the web application and user interfaces for ExamSentinel, including examination workflows, administrative interfaces, candidate experiences, monitoring features, and communication with the ExamSentinel backend.

## Before You Start

Please:

- Read this document before making changes.
- Check existing issues and pull requests before starting duplicate work.
- Keep changes focused and avoid unrelated refactoring.
- Never commit passwords, API keys, tokens, `.env` files, student information, examination data, biometric information, or other sensitive information.
- Do not introduce breaking changes without clearly documenting them.

## Getting the Repository

Fork the repository on GitHub, then clone your fork:

```bash
git clone <YOUR_FORK_URL>
cd ExamSentinel-Frontend
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
feature/exam-monitoring-ui
fix/login-validation
docs/update-setup-guide
refactor/exam-dashboard
chore/update-dependencies
```

Avoid making unrelated changes in the same branch.

## Development Guidelines

When working on the frontend:

- Follow the existing React and component structure.
- Reuse existing components and utilities where appropriate.
- Keep components focused and maintainable.
- Follow the existing styling conventions.
- Keep API communication in the appropriate service layer.
- Do not place secrets in frontend source code.
- Do not hard-code production URLs when environment configuration is appropriate.
- Preserve existing route protection and permission checks.
- Consider loading, error, empty, and success states for user-facing features.
- Maintain accessible labels and controls where practical.
- Avoid unnecessary dependencies.
- Do not change application behavior unrelated to the feature or fix.

## Exam Security Features

ExamSentinel contains examination-security and monitoring functionality.

Changes affecting:

- Full-screen behavior
- Tab-switch detection
- Clipboard restrictions
- Back-navigation protection
- Inactivity detection
- DevTools/inspection detection
- Exam submission
- Exam timers
- Authentication
- Candidate verification
- Activity logging

should be treated as security-sensitive changes.

Do not weaken or bypass these controls merely to simplify development.

If a monitoring mechanism needs to change, clearly explain the reason and expected impact in the pull request.

## API Integration

When adding or modifying API calls:

- Use the existing service/API layer.
- Follow existing request and response conventions.
- Handle loading and error states.
- Do not expose credentials or sensitive response data unnecessarily.
- Update frontend documentation when configuration changes.
- Coordinate API changes with the backend repository when required.

If the backend endpoint changes, clearly identify the corresponding backend change in the pull request.

## State Management

Use the existing state-management approach where possible.

Before adding new global state:

- Check whether the data can remain local to the component.
- Check whether an existing Redux slice/context already handles the data.
- Avoid duplicating the same state in multiple places.

Keep Redux actions, reducers, selectors, and API interactions consistent with the existing architecture.

## UI and Accessibility

When changing the interface:

- Maintain consistent spacing, typography, and component behavior.
- Ensure interactive elements have meaningful labels.
- Support keyboard interaction where appropriate.
- Avoid relying solely on color to communicate information.
- Provide useful loading and error states.
- Keep responsive behavior in mind.
- Do not introduce unnecessary visual changes unrelated to the task.

## Commit Messages

Use concise, descriptive commit messages.

Recommended format:

```text
<type>: <short description>
```

Examples:

```text
feat: add examination monitoring screen
fix: resolve login redirect issue
docs: update frontend setup guide
refactor: simplify exam dashboard
chore: update dependencies
test: add exam component tests
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
- Start the development server successfully.
- Test the affected UI workflow.
- Test relevant routes and permissions.
- Verify API integration where applicable.
- Run available linting/build commands.
- Check responsive behavior for affected screens.
- Confirm no secrets or sensitive files are included.

Recommended checks:

```bash
npm run lint
npm run build
```

If automated tests do not exist for the affected functionality, manually verify the workflow and explain this in the pull request.

## Pull Requests

Create a pull request from your feature/fix branch into the appropriate default branch.

A good pull request should include:

### Description

Explain:

- What changed?
- Why was it changed?
- Which screens/features are affected?

### Testing

Explain:

- What commands were run?
- What UI workflows were tested?
- Which browsers/devices were considered where relevant?

### API Dependencies

If the change requires a backend change, clearly mention it.

### Security

Confirm that:

- No secrets were committed.
- No real student/examination data was added.
- Existing authentication and exam-security controls were preserved.

### Breaking Changes

Clearly identify any changes that require new environment variables, backend updates, route changes, or other configuration changes.

## Pull Request Checklist

Before submitting:

- [ ] The change is focused and necessary.
- [ ] Existing functionality has been preserved.
- [ ] Code follows the existing project conventions.
- [ ] Relevant documentation has been updated.
- [ ] `npm run lint` has been run where applicable.
- [ ] `npm run build` succeeds.
- [ ] UI changes have been manually tested.
- [ ] No `.env` files or secrets are included.
- [ ] No real student, biometric, or examination data is included.
- [ ] Backend/API dependencies are documented if applicable.
- [ ] Breaking changes are clearly identified.

## Reporting Bugs

When reporting a bug, include:

- A clear description.
- Steps to reproduce.
- Expected behavior.
- Actual behavior.
- Affected page/component.
- Browser and operating system where relevant.
- Relevant console/network errors with secrets removed.

Never include passwords, tokens, private API responses, or personal student information in an issue.

## Feature Requests

For a feature request, explain:

- The problem being solved.
- The proposed user experience.
- Why it would benefit ExamSentinel.
- Any frontend/backend implications.
- Any changes to authentication, permissions, or examination security.

## Code Review

Reviewers may request changes related to:

- Correctness
- Security
- User experience
- Accessibility
- Performance
- Maintainability
- API integration
- Responsive behavior
- Documentation
- Testing

Please address review feedback before merging.

## Scope

Contributions should remain relevant to the ExamSentinel frontend.

Avoid unrelated rewrites, framework migrations, dependency upgrades, or architectural changes unless they are discussed and approved first.

## License

By contributing, you agree that your contributions will be made available under the project's **MIT License**.

Copyright © 2026 **Arib Khan and Aditya Jaiswal**.

---

Thank you for helping improve **ExamSentinel Frontend**.
