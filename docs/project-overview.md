# Untrivial - Project Overview

This document provides a high-level overview of the Untrivial project.

## 1. Introduction

Untrivial is an interactive quiz application that allows users to create, manage, and take quizzes. The application features Google authentication for user management.

## 2. Technologies

The backend is built with:

*   **Framework**: Fastify
*   **Database**: PostgreSQL
*   **ORM**: Prisma
*   **Validation**: Zod

## 3. Project Structure

The project follows a modular structure, separating concerns into the following directories:

*   `src/routes`: Defines the API endpoints.
*   `src/services`: Contains the business logic.
*   `src/schemas`: Defines the data structures and validation schemas.
*   `docs`: Contains the project documentation.
*   `prisma`: Contains the database schema and migration files.

## 4. Authentication

User authentication is handled through Google OAuth.

## 5. Database Schema

The database schema is defined in `prisma/schema.prisma`. It includes tables for users and quizzes. The quiz table uses a `Json` column (`JSONB` in PostgreSQL) to store the quiz content. The application layer enforces a strict structure on this field, expecting an array of question objects, where each question includes its title, a list of possible options, and a reference to the correct option's ID.
