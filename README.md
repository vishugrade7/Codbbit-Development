
# Codbbit - Salesforce Apex Coding Platform

Codbbit is a web application designed to help Salesforce developers practice and improve their Apex coding skills. It provides a platform for solving real-world coding challenges, competing on leaderboards, and preparing for technical interviews. The platform is built with Next.js, Firebase, and Google's Genkit for AI-powered features.

## Table of Contents

- [Getting Started](#getting-started)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
  - [Firebase Integration](#firebase-integration)
  - [AI-Powered Features (Genkit)](#ai-powered-features-genkit)
  - [Salesforce Integration](#salesforce-integration)
- [Running the Project](#running-the-project)

## Getting Started

To get the project running locally, you'll need to have Node.js and npm installed. The project is already configured to connect to a Firebase backend.

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Run the development server:**
    ```bash
    npm run dev
    ```
This will start the Next.js development server, typically on `http://localhost:3000`.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (React)
- **Database & Auth:** [Firebase](https://firebase.google.com/) (Firestore, Authentication)
- **AI:** [Google Genkit](https://firebase.google.com/docs/genkit)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
- **Code Editor:** [Monaco Editor](https://microsoft.github.io/monaco-editor/)

---

## Project Structure

Below is a detailed breakdown of the project's directory and file structure.

### Root Directory

-   `.env`: Stores environment variables. Critical for services like Salesforce and LinkedIn OAuth.
-   `apphosting.yaml`: Configuration for Firebase App Hosting.
-   `components.json`: Configuration for ShadCN UI components.
-   `docs/backend.json`: A blueprint of the Firebase data structures, entities, and auth setup. Used for reference and code generation.
-   `next.config.ts`: Configuration file for Next.js, including image optimization and server options.
-   `package.json`: Lists project dependencies and scripts.
-   `tailwind.config.ts`: Configuration for Tailwind CSS.
-   `tsconfig.json`: TypeScript configuration for the project.

### `src/app/` - Routing and Pages

This directory uses the Next.js App Router. Each folder represents a route segment.

-   **`layout.tsx`**: The root layout for the entire application. It sets up the main HTML structure, Firebase providers, and global styles.
-   **`page.tsx`**: The main landing page or dashboard for authenticated users.
-   **`login/page.tsx` & `signup/page.tsx`**: Pages for user authentication, utilizing the `AuthForm` component.
-   **`admin/`**: Contains pages for the admin dashboard, including user management, problem creation, and analytics.
-   **`problems/[category]/[problemId]/page.tsx`**: The main problem-solving page, featuring the code editor and question panel.
-   **`settings/`**: A nested layout for all user settings pages (profile, password, etc.).
-   **`[username]/page.tsx`**: The public user profile page.

### `src/components/` - Reusable UI Components

This folder contains all the React components used throughout the application.

-   **`AuthForm.tsx`**: Handles both user login and signup, including form validation, authentication logic, and username uniqueness checks.
-   **`AppSidebar.tsx` & `AdminSidebar.tsx`**: The primary navigation sidebars for regular users and administrators.
-   **`CodingPanel.tsx` & `QuestionPanel.tsx`**: The two main panels of the problem-solving UI. `CodingPanel` includes the code editor and submission logic, while `QuestionPanel` displays the problem details.
-   **`LeaderboardClient.tsx`**: Fetches and displays the user leaderboard with filtering and pagination.
-   **`ProfilePageClient.tsx`**: Renders the user profile, including stats, contribution graph, and recent activity.
-   **`ui/`**: Contains the UI components from ShadCN, such as `Button`, `Card`, `Input`, etc. These are the building blocks of the application's UI.

### `src/firebase/` - Firebase Configuration

This directory centralizes all Firebase-related setup and hooks.

-   **`config.ts`**: Exports the Firebase configuration object used to initialize the client-side SDK.
-   **`client-provider.tsx`**: A client-side component that ensures Firebase is initialized only once. It wraps the main `FirebaseProvider`.
-   **`provider.tsx`**: The core Firebase context provider. It initializes the authentication state listener and provides the Firebase app, auth, and firestore instances to the rest of the app. It also exports hooks like `useFirebase()`, `useUser()`, `useAuth()`, and `useFirestore()`.
-   **`server-init.ts`**: Initializes the Firebase Admin SDK for use in server-side actions and API routes.
-   **`firestore/`**:
    -   `use-collection.tsx`: A hook to subscribe to a Firestore collection in real-time.
    -   `use-doc.tsx`: A hook to subscribe to a single Firestore document in real-time.
-   **`non-blocking-updates.tsx` & `non-blocking-login.tsx`**: Contain functions for performing Firestore writes and authentication without blocking the UI, improving perceived performance.

### `src/ai/` - Genkit AI Flows

This directory contains all the server-side AI logic, implemented as Genkit flows.

-   **`genkit.ts`**: Initializes the global Genkit `ai` object and configures the Google AI plugin.
-   **`flows/`**:
    -   `ask-question.ts`: An AI agent that answers user questions about a coding problem without giving away the solution.
    -   `generate-problem.ts`: An agent that can generate a new coding problem, including its description, starter code, and test cases, based on given criteria.
    -   `is-username-unique.ts`: A flow that checks if a given username is already taken in the database.
    -   `get-user-profile-by-username.ts`: Fetches a user's profile from Firestore using their username.

### `src/lib/` - Libraries and Utilities

This folder contains shared utilities, type definitions, and server-side actions.

-   **`actions.ts`**: Contains Server Actions for interacting with the Salesforce API, such as executing code and managing metadata.
-   **`countries.ts`**: A static list of countries for the signup form.
-   **`mail.ts`**: A Server Action for sending emails (e.g., feedback forms) using Nodemailer.
-   **`types.ts`**: Defines all major TypeScript types used across the application, such as `UserProfile`, `Question`, and `ProblemSheet`.
-   **`utils.ts`**: General utility functions, including the `cn` function for merging Tailwind CSS classes.

### `src/hooks/` - Custom React Hooks

-   **`use-debounce.ts`**: A simple hook to debounce a value, useful for delaying expensive operations like API calls until the user has stopped typing.
-   **`use-mobile.tsx`**: A hook that returns `true` if the user is on a mobile-sized screen.
-   **`use-toast.ts`**: The hook for using the application's toast notification system.

---

## Key Features

### Firebase Integration

-   **Authentication**: Users can sign up and log in using email/password. The `useUser` hook provides the current user's state throughout the app.
-   **Firestore**: The database is structured to hold `users`, `problems`, `sheets`, and `vouchers`. The `useCollection` and `useDoc` hooks provide real-time data fetching.
-   **Error Handling**: A custom error handling system (`errors.ts`, `error-emitter.ts`) is in place to catch and display detailed Firestore permission errors during development.

### AI-Powered Features (Genkit)

-   **Problem Generation**: Admins can use AI to generate new coding problems.
-   **AI Tutor**: Users can ask for hints from "Codbee," an AI assistant that guides them toward the solution.
-   **Username Validation**: The signup form uses a Genkit flow to check for username uniqueness in real-time.

### Salesforce Integration

-   **OAuth 2.0**: Users can securely connect their Salesforce Developer Orgs.
-   **Code Execution**: The app uses the Tooling API to execute Apex code (anonymous blocks and test classes) directly against the user's connected org.
-   **Metadata Deployment**: Solution code and test classes are deployed to the user's org for execution.

## Running the Project

To run the project, ensure you have set up your environment variables in a `.env.local` file at the root of the project. Then, use the following commands:

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# To run the Genkit development server (for AI flows)
npm run genkit:dev
```
