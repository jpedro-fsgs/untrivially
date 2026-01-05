# Untrivially - Domain Model Documentation

This document outlines the core domain models for the Untrivially application, representing the central entities of the system.

## User Model

The `User` model represents an individual who can create and interact with quizzes.

*   **`id`** (`String` / `uuid`): A unique identifier for the user.
*   **`name`** (`String`): The user's full name.
*   **`email`** (`String`): The user's email address, used as a unique identifier for login.
*   **`avatarUrl`** (`String` | `null`): A URL pointing to the user's profile picture.
*   **`createdAt`** (`DateTime`): The timestamp when the user was created.

## Quiz Model

The `Quiz` model represents a collection of questions created by a user.

*   **`id`** (`String` / `uuid`): A unique identifier for the quiz.
*   **`title`** (`String`): The title of the quiz.
*   **`userId`** (`String`): A foreign key linking to the `User` who created the quiz.
*   **`createdAt`** (`DateTime`): The timestamp when the quiz was first created.
*   **`updatedAt`** (`DateTime`): The timestamp of the last update to the quiz.
*   **`questions`** (`Json`): A JSONB column in the database that stores the quiz's content. The backend validates and expects this field to be an array of `Question` objects.

### Structure of the `questions` Field

The `questions` JSON field contains an array of objects, where each object represents a single question and has the following structure:

```typescript
{
  "questionId": "string",       // Unique ID for the question
  "title": "string",            // The text of the question
  "imageUrl": "string" | null,  // Optional URL for an image related to the question
  "correctOptionId": "string",  // The `optionId` of the correct answer
  "options": [                  // An array of 2 or more options
    {
      "optionId": "string",       // Unique ID for the option
      "text": "string",           // The text of the option
      "imageUrl": "string" | null // Optional URL for an image related to the option
    }
  ]
}
```
This structure is enforced by the application's service layer and Zod schemas, ensuring data integrity even though the database schema itself is flexible with a `Json` type.
