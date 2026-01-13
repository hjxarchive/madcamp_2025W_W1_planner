# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Momento is a time tracking and productivity mobile application built with a monorepo structure. It helps users manage personal and collaborative projects with checklist-based task tracking, real-time timers, and daily activity receipts.

## Tech Stack

- **Backend**: NestJS 11 + Prisma 6 + PostgreSQL 16 + Socket.io
- **Frontend**: React Native 0.73 (Android only) + React Navigation 6
- **Auth**: Firebase Auth (Google Sign-in) with token verification via firebase-admin

## Common Commands

### Backend (`/backend`)
```bash
npm run start:dev          # Development server with hot reload
npm run build              # Build TypeScript
npm run start:prod         # Production server
npm run lint               # ESLint check + fix
npm run format             # Prettier formatting
npm test                   # Run unit tests
npm run test:e2e           # Run e2e tests

# Prisma
npx prisma generate        # Generate Prisma client
npx prisma migrate dev     # Create/apply migration (development)
npx prisma migrate deploy  # Apply migrations (production)
npx prisma studio          # Open DB GUI at localhost:5555
```

### Frontend (`/frontend`)
```bash
npm start                  # Start Metro bundler
npm run android            # Build and run on Android device/emulator
npm run clean              # Clean Android build (./gradlew clean)
npm run build:android      # Build release APK

# APK output: android/app/build/outputs/apk/
```

## Architecture

### Backend Module Structure
The backend uses NestJS modular architecture with feature modules:

```
src/
├── prisma/         # PrismaService (global database access)
├── common/         # Shared guards and decorators
│   ├── guards/firebase-auth.guard.ts   # Firebase token verification
│   └── decorators/current-user.decorator.ts  # Extract user from request
├── users/          # User CRUD, profile management
├── projects/       # Project CRUD with member management
├── checklists/     # Task items within projects
├── time-logs/      # Time tracking records
├── timer/          # WebSocket gateway for real-time timer sync
├── locations/      # Study locations
├── study-sessions/ # Real-time study room sessions
└── receipts/       # Daily activity receipts with image generation
```

### Database Schema (Prisma)
Core models: `User`, `Project`, `ProjectMember`, `Checklist`, `TimeLog`, `StudySession`, `Location`, `DailyReceipt`

- Projects have a status flow: `ACTIVE` → `PENDING_REVIEW` → `COMPLETED`
- TimeLogs track work sessions on Checklists
- StudySessions enable real-time "study together" feature

### Frontend Structure
```
src/
├── screens/        # Main screens (Home, Past, Study, Collab, ProjectDetail)
├── components/     # Reusable UI components
├── navigation/     # React Navigation setup (RootNavigator, BottomTabNavigator)
├── services/       # API client (api.ts) and WebSocket client (socket.ts)
├── contexts/       # AuthContext for Firebase auth state
├── constants/      # Colors, fonts, spacing, API_BASE_URL
└── types/          # TypeScript interfaces
```

### Real-time Communication
- Socket.io namespace: `/timer`
- Events: `timer:start`, `timer:stop`, `timer:sync`, `timer:tick`, `timer:active`, `timer:none`
- Used for syncing timer state across devices and broadcasting to project members

## Key Patterns

### Authentication Flow
1. Frontend uses Firebase Auth (Google Sign-in)
2. Firebase ID token sent as `Authorization: Bearer <token>`
3. Backend `FirebaseAuthGuard` verifies token via firebase-admin
4. In development mode (`NODE_ENV !== 'production'`), `dev-token` bypasses auth with user ID `dev-user-001`

### API Client Pattern
- All API calls go through `ApiService` class in `frontend/src/services/api.ts`
- Typed responses with `ApiResponse<T>` wrapper
- Base URL configured in `frontend/src/constants/index.ts`

### NestJS Guard Usage
```typescript
@UseGuards(FirebaseAuthGuard)
@Controller('projects')
export class ProjectsController {
  @Get()
  getProjects(@CurrentUser() user: FirebaseUser) { ... }
}
```

## Environment Variables

### Backend
- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Server port (default 3000)
- `NODE_ENV`: `development` or `production`
- `FIREBASE_PROJECT_ID`: Firebase project ID for auth verification

### Frontend
- `API_BASE_URL` in constants: API server URL (currently hardcoded)

## Testing

### Backend
- Unit tests: `*.spec.ts` files alongside source files
- E2E tests: `test/` directory with `jest-e2e.json` config
- Run single test: `npm test -- --testNamePattern="test name"`

### Frontend
- Jest with react-test-renderer
- Run: `npm test`

## Notes

- This is an Android-only app (no iOS support currently)
- Korean language is used in UI strings and commit messages
- The main branch is `main`, currently working on `native` feature branch
