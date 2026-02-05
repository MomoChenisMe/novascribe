---
name: tdd-workflow
description: Use this skill when writing new features, fixing bugs, or refactoring code. Enforces test-driven development with 80%+ coverage including unit, integration, and E2E tests.
---

# Test-Driven Development Workflow

This skill ensures all code development follows TDD principles with comprehensive test coverage.

## Core Principles

1. **Tests BEFORE Code**: ALWAYS write tests first, then implement code to make tests pass.
2. **Coverage Requirements**: Minimum 80% coverage.
3. **Test Types**: Unit, Integration, and E2E (Playwright).

## TDD Workflow Steps

1. **Write User Journeys**: "As a [role], I want to [action], so that [benefit]"
2. **Generate Test Cases**: For each user journey, create comprehensive test cases.
3. **Run Tests (They Should Fail)**: Confirm they fail before implementation.
4. **Implement Code**: Write minimal code to make tests pass.
5. **Run Tests Again**: Ensure they now pass.
6. **Refactor**: Improve code quality while keeping tests green.
7. **Verify Coverage**: Ensure 80%+ coverage.
