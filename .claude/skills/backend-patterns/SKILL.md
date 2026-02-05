---
name: backend-patterns
description: Backend architecture patterns, API design, database optimization, and server-side best practices for Node.js, Express, and Next.js API routes.
---

# Backend Development Patterns

## Patterns
1. **Repository Pattern**: Abstract data access logic.
2. **Service Layer Pattern**: Business logic separated from data access.
3. **Middleware Pattern**: Request/response processing pipeline (e.g., `withAuth`).

## Database
- **Optimization**: Select only needed columns.
- **N+1 Prevention**: Use batch fetching.
- **Transactions**: Use RPC or transaction blocks for atomic operations.

## Error Handling
- **Centralized Handler**: Use standard Error classes and response structures.
- **Exponential Backoff**: Use for retrying external API calls.
