# Untrivial - Domain Model Documentation

This document outlines the core domain models for the Untrivial application, representing the central entities of the system.

## User Model

The `User` model represents an individual who can create and interact with quizzes.

*   **`id`** (`String` / `uuid`): A unique identifier for the user.
*   **`name`** (`String`): The user's full name.
*   **`email`** (`String`): The user's email address, used as a unique identifier for login.
*   **`avatarUrl`** (`String` | `null`): A URL pointing to the user's profile picture.
*   **`createdAt`** (`DateTime`): The timestamp when the user was created.

## RefreshToken Model

The `RefreshToken` model represents an authenticated user's session on a specific device. A user can have multiple refresh tokens, allowing them to be logged in on multiple devices simultaneously.

*   **`id`** (`String` / `uuid`): A unique identifier for the token/session record.
*   **`hashedToken`** (`String`): The SHA-256 hash of the opaque refresh token. This is what's stored to prevent session hijacking even if the database is compromised.
*   **`userId`** (`String`): A foreign key linking to the `User` who owns this session.
*   **`userAgent`** (`String`): The User-Agent string of the client, used for display in a "connected devices" list.
*   **`ipAddress`** (`String`): The IP address from which the session was initiated.
*   **`createdAt`** (`DateTime`): The timestamp when the session was created.
*   **`updatedAt`** (`DateTime`): The timestamp of the last update, which corresponds to the last time the token was rotated.

## Quiz, Question, and Answer Models

The quiz domain is now modeled using three distinct relational tables: `Quiz`, `Question`, and `Answer`. This provides a more structured and scalable way to manage quiz content compared to the previous JSON-based approach.

### Quiz Model

The `Quiz` model represents the top-level container for a quiz.

*   **`id`** (`String` / `uuid`): A unique identifier for the quiz.
*   **`subId`** (`String`): A short, human-readable ID (e.g., "K8BMY") used as a prefix for generating unique IDs for its child questions and answers.
*   **`title`** (`String`): The title of the quiz.
*   **`userId`** (`String`): A foreign key linking to the `User` who created the quiz.
*   **`createdAt`** (`DateTime`): The timestamp when the quiz was first created.
*   **`updatedAt`** (`DateTime`): The timestamp of the last update to the quiz.
*   **Relations**:
    *   A `Quiz` has many `Question` records.

### Question Model

The `Question` model represents a single question within a `Quiz`.

*   **`id`** (`String`): A unique identifier for the question, composed of the parent quiz's `subId` and a generated short ID (e.g., "K8BMY-1AYTG").
*   **`title`** (`String`): The text content of the question.
*   **`imageUrl`** (`String` | `null`): An optional URL for an image related to the question.
*   **`quizId`** (`String`): A foreign key linking to the `Quiz` this question belongs to.
*   **`createdAt`** (`DateTime`): The timestamp when the question was created.
*   **`updatedAt`** (`DateTime`): The timestamp of the last update.
*   **Relations**:
    *   A `Question` belongs to one `Quiz`.
    *   A `Question` has many `Answer` records.

### Answer Model

The `Answer` model represents a single answer option for a `Question`.

*   **`id`** (`String`): A unique identifier for the answer, composed of the parent question's ID and a generated short ID (e.g., "K8BMY-1AYTG-PCAJ3").
*   **`text`** (`String`): The text content of the answer.
*   **`imageUrl`** (`String` | `null`): An optional URL for an image related to the answer.
*   **`isCorrect`** (`Boolean`): A flag indicating whether this is the correct answer for the question.
*   **`questionId`** (`String`): A foreign key linking to the `Question` this answer belongs to.
*   **`createdAt`** (`DateTime`): The timestamp when the answer was created.
*   **`updatedAt`** (`DateTime`): The timestamp of the last update.
*   **Relations**:
    *   An `Answer` belongs to one `Question`.
