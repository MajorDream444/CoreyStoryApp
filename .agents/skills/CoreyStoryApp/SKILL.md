```markdown
# CoreyStoryApp Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill outlines the core development practices and workflows for the CoreyStoryApp repository, a TypeScript codebase with a focus on clarity, maintainability, and production readiness. It covers coding conventions, commit patterns, workflow automation, and testing strategies to help contributors collaborate efficiently and consistently.

## Coding Conventions

**File Naming**
- Use `snake_case` for all file names.
  - Example: `user_profile.ts`, `story_utils.ts`

**Import Style**
- Use relative imports for modules within the project.
  - Example:
    ```typescript
    import { getUser } from './user_profile';
    ```

**Export Style**
- Use named exports for all modules.
  - Example:
    ```typescript
    // In user_profile.ts
    export function getUser(id: string) { /* ... */ }
    ```

**Commit Patterns**
- Follow [Conventional Commits](https://www.conventionalcommits.org/) with the `chore` prefix being common.
  - Example:
    ```
    chore: update production readiness checklist for agents
    ```

## Workflows

### Add Production Readiness Control
**Trigger:** When you need to introduce or update production readiness documentation or checklists for a component or workflow.  
**Command:** `/add-production-readiness`

1. Identify the component or process that requires production readiness documentation.
2. Create or update a markdown file with relevant information (e.g., `AGENTS.md`, `CLAUDE.md`, `.github/PRODUCTION_READINESS.md`, `.github/pull_request_template.md`).
3. Commit your changes with a message indicating production readiness control.
   - Example commit message:
     ```
     chore: update production readiness for story agents
     ```
4. Open a pull request for review.

**Example:**
```markdown
# AGENTS.md

## Production Readiness Checklist
- [x] Error handling implemented
- [x] Logging enabled
- [ ] Load tested
```

## Testing Patterns

- Test files are named with the pattern `*.test.*`.
  - Example: `user_profile.test.ts`
- The specific testing framework is not detected; follow existing patterns or consult maintainers for guidance.
- Place test files alongside the modules they test or in a dedicated `tests/` directory.

**Example:**
```typescript
// user_profile.test.ts
import { getUser } from './user_profile';

test('getUser returns correct user', () => {
  // ...test implementation
});
```

## Commands
| Command                   | Purpose                                                      |
|---------------------------|--------------------------------------------------------------|
| /add-production-readiness | Add or update production readiness documentation/checklists   |
```
