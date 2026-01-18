# Untrivially - API Documentation

This document outlines the API endpoints for the Untrivially application.

## Authentication

The API uses a two-token system for authentication and session management to ensure both security and a good user experience.

-   **Access Token**: A short-lived (15 minutes) JSON Web Token (JWT) that is used to access protected resources. It must be sent in the `Authorization` header of your requests using the `Bearer` scheme.
    -   Example: `Authorization: Bearer <your_access_token>`
-   **Refresh Token**: A long-lived (30 days), opaque (unreadable) token stored in a secure, `HttpOnly` cookie named `untrivially_refresh_token`. This token is used solely to obtain a new Access Token when the old one expires. Your client does not need to handle this token directly; the browser will manage it automatically.

The general flow is:
1.  Log in via the Google OAuth endpoint.
2.  Receive an `accessToken` in the response body and a `refresh_token` in a cookie.
3.  Use the `accessToken` to make API calls.
4.  When the `accessToken` expires (you get a `401 Unauthorized`), call the `POST /auth/refresh` endpoint.
5.  Receive a new `accessToken` and continue making API calls.

## Authentication Endpoints

*   **GET /me**
    *   Returns the profile of the currently authenticated user.
    *   Requires a valid Access Token.
    *   **Responses**:
        *   `200 OK`: Returns a user object.
        *   `401 Unauthorized`: The Access Token is missing, invalid, or expired.

*   **GET /auth/google/callback**
    *   This is the callback endpoint for the Google OAuth2 flow. It is not meant to be called directly by the client application.
    *   Upon successful authentication with Google, it creates a user session.
    *   **Responses**:
        *   `200 OK`: Returns an object containing the initial `accessToken` and `user` profile, while also setting the `untrivially_refresh_token` in an `HttpOnly` cookie.
            ```json
            {
              "accessToken": "ey...",
              "user": {
                "id": "...",
                "name": "...",
                "email": "...",
                "avatarUrl": "..."
              }
            }
            ```

*   **POST /auth/refresh**
    *   Renews the user's session by providing a new Access Token. This endpoint uses Refresh Token Rotation for enhanced security.
    *   It does not require an `Authorization` header. It relies on the `untrivially_refresh_token` cookie sent by the browser.
    *   **Responses**:
        *   `200 OK`: Returns an object containing the new `accessToken`. A new refresh token is also set in the cookie, replacing the old one.
            ```json
            {
              "accessToken": "ey..."
            }
            ```
        *   `401 Unauthorized`: The refresh token is missing, invalid, or has already been used (potential theft attempt). The user must log in again.

*   **POST /auth/logout**
    *   Logs the user out by invalidating their session on the server and clearing the refresh token cookie.
    *   **Responses**:
        *   `204 No Content`: The user was successfully logged out.

*   **GET /auth/sessions**
    *   Returns all active sessions for the currently authenticated user. This can be used to display a list of devices where the user is logged in.
    *   Requires a valid Access Token.
    *   **Responses**:
        *   `200 OK`: Returns an array of session objects, ordered by the most recently created. The `isCurrent` flag indicates the session from which the request was made.
            ```json
            [
              {
                "id": "cltpsx1af000108l5g1f3h9q0",
                "userAgent": "Mozilla/5.0 (X11; Linux x86_64) ...",
                "ipAddress": "127.0.0.1",
                "createdAt": "2026-01-18T20:30:00.000Z",
                "updatedAt": "2026-01-18T20:30:00.000Z",
                "isCurrent": true
              },
              {
                "id": "cltpswrcn000008l5bza7a1b2",
                "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2_1 like Mac OS X) ...",
                "ipAddress": "192.168.1.100",
                "createdAt": "2026-01-17T18:45:00.000Z",
                "updatedAt": "2026-01-17T18:45:00.000Z",
                "isCurrent": false
              }
            ]
            ```
        *   `401 Unauthorized`: The Access Token is missing, invalid, or expired.

## Quiz Endpoints

*   **POST /quizzes**
    *   Creates a new quiz.
    *   Requires authentication (valid Access Token).
    *   **Request Body**:
        ```json
        {
          "title": "My Awesome Quiz About Birds",
          "questions": [
            {
              "title": "What is the fastest bird in the world?",
              "options": [
                { "text": "Ostrich" },
                { "text": "Peregrine Falcon" }
              ],
              "correctOptionIndex": 1
            }
          ]
        }
        ```
    *   **Responses**:
        *   `201 Created`: The quiz was created successfully.
        *   `400 Bad Request`: The request body is malformed.
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
    *   **Request Body**: `{ "title": "New Updated Title" }`
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
