---
name: coding-standards
description: Universal coding standards, best practices, and patterns for TypeScript, JavaScript, React, and Node.js development.
---

# Coding Standards & Best Practices

## Code Quality Principles
1. **Readability First**: Clear names, self-documenting code.
2. **KISS**: Simplest solution that works.
3. **DRY**: Avoid duplication.
4. **YAGNI**: Don't build speculative features.

## TypeScript/JavaScript Standards
- **Naming**: Descriptive `marketSearchQuery` vs `q`.
- **Immutability**: ALWAYS use spread operator `...`, NEVER mutate directly.
- **Async/Await**: Use `Promise.all` for parallel execution where possible.
- **Type Safety**: Avoid `any`, use proper interfaces.

## React Best Practices
- **Functional Components**: Use typed props.
- **Custom Hooks**: Extract logic into reusable hooks.
- **Conditional Rendering**: Use clear logic like `{isLoading && <Spinner />}`.

## API Design
- **RESTful**: Resource-based URLs (`/api/markets`).
- **Standard Responses**: Use consistent structure `{success: boolean, data?: T, error?: string}`.
