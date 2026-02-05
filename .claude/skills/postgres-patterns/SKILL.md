---
name: postgres-patterns
description: PostgreSQL database patterns for query optimization, schema design, indexing, and security. Based on Supabase best practices.
---

# PostgreSQL Patterns

## Indexing
- **B-tree**: Default for equality and range.
- **Composite**: Equality columns first, then range.
- **GIN**: For JSONB and text search.
- **Partial**: Index only a subset of rows (e.g., `WHERE deleted_at IS NULL`).

## Data Types
- **IDs**: `bigint` (prefer over `int`).
- **Strings**: `text` (prefer over `varchar(255)`).
- **Time**: `timestamptz`.

## Best Practices
- **Cursor Pagination**: Use `WHERE id > $last_id` for O(1) performance.
- **UPSERT**: `ON CONFLICT (...) DO UPDATE`.
- **RLS**: Optimize Row Level Security with `(SELECT auth.uid())`.
