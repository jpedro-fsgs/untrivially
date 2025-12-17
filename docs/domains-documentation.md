# Untrivially - Domain Documentation

This document outlines the project domains for the Untrivially application.

## Authentication

All endpoints that require authentication must include a valid JWT in the `Authorization` header.

## Domains

### Quizzes

*   **POST /quizzes**
    *   The user will send a `JSON` with the quiz structure, it will be validated with `zod` and then the `questions` object will be saved as `JSONB` in the database.
*   **GET /quizzes**
    *   Returns all quizzes created by the authenticated user.
*   **GET /quizzes/:id**
    *   Returns a specific quiz by its ID.
*   **PUT /quizzes/:id**
    *   Updates a specific quiz by its ID.
    *   Request body: (same as POST /quizzes)
*   **DELETE /quizzes/:id**
    *   Deletes a specific quiz by its ID.
*   **`Untrivially-Token`**
    *   All authenticated routes will receive a user through the `Untrivially-Token` token.
