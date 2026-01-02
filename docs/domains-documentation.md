# Untrivially - Domain Documentation

This document outlines the project domains for the Untrivially application.

## Authentication

Authentication is handled via an `HttpOnly` cookie (`untrivially_token`) containing a JWT, which is automatically sent by the browser on requests to the API after logging in. The server validates this token on protected routes.

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
