# Untrivially - API Documentation

This document outlines the API endpoints for the Untrivially application.

## Authentication

Endpoints that require authentication are protected and expect a JWT. This JWT is handled by the server via an `HttpOnly` cookie (`untrivially_token`) which is set during the OAuth login flow. API clients (like a web browser) should automatically include this cookie in subsequent requests.

## Endpoints

### Quizzes

*   **POST /quizzes**
    *   Creates a new quiz.
    *   Requires authentication.
    *   **Request Body**:
        ```json
        {
          "title": "My Awesome Quiz About Birds",
          "questions": [
            {
              "title": "What is the fastest bird in the world?",
              "imageUrl": "https://example.com/falcon.jpg",
              "options": [
                { "text": "Ostrich" },
                { "text": "Peregrine Falcon" },
                { "text": "Hummingbird" }
              ],
              "correctOptionIndex": 1
            }
          ]
        }
        ```
    *   **Responses**:
        *   `201 Created`: The quiz was created successfully.
        *   `400 Bad Request`: The request body is malformed or fails validation (e.g., missing title, not enough options for a question).
        *   `401 Unauthorized`: The user is not authenticated.

*   **GET /quizzes**
    *   Returns all quizzes created by the authenticated user.
    *   Requires authentication.
    *   **Responses**:
        *   `200 OK`: Returns an object containing an array of quizzes.
        *   `401 Unauthorized`: The user is not authenticated.

*   **GET /quizzes/:id**
    *   Returns a specific quiz by its ID.
    *   Requires authentication.
    *   **Responses**:
        *   `200 OK`: Returns the quiz object.
        *   `404 Not Found`: No quiz with the given ID was found.
        *   `401 Unauthorized`: The user is not authenticated.

*   **PUT /quizzes/:id**
    *   Updates a specific quiz by its ID. The user must be the owner of the quiz.
    *   Requires authentication.
    *   **Request Body**: The body can contain an optional `title` and/or `questions`. The `questions` must adhere to the full, validated schema, including `questionId` and `correctOptionId`.
        ```json
        {
          "title": "New Updated Title"
        }
        ```
    *   **Responses**:
        *   `204 No Content`: The quiz was updated successfully.
        *   `404 Not Found`: No quiz with the given ID was found.
        *   `401 Unauthorized`: The user is not authenticated.

*   **DELETE /quizzes/:id**
    *   Deletes a specific quiz by its ID. The user must be the owner of the quiz.
    *   Requires authentication.
    *   **Responses**:
        *   `204 No Content`: The quiz was deleted successfully.
        *   `404 Not Found`: No quiz with the given ID was found.
        *   `401 Unauthorized`: The user is not authenticated.
