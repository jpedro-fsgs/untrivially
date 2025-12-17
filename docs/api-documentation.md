# Untrivially - API Documentation

This document outlines the API endpoints for the Untrivially application.

## Authentication

All endpoints that require authentication must include a valid JWT in the `Authorization` header.

## Endpoints

### Quizzes

*   **POST /quizzes**
    *   Creates a new quiz.
    *   Requires authentication.
    *   Request body:
        ```json
        {
          "title": "Quiz Title",
          "questions": [
            {
              "question": "Question 1",
              "options": ["Option 1", "Option 2", "Option 3"],
              "answer": "Option 1"
            }
          ]
        }
        ```

*   **GET /quizzes**
    *   Returns all quizzes created by the authenticated user.
    *   Requires authentication.

*   **GET /quizzes/:id**
    *   Returns a specific quiz by its ID.
    *   Requires authentication.

*   **PUT /quizzes/:id**
    *   Updates a specific quiz by its ID.
    *   Requires authentication.
    *   Request body: (same as POST /quizzes)

*   **DELETE /quizzes/:id**
    *   Deletes a specific quiz by its ID.
    *   Requires authentication.
