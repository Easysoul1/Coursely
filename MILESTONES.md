# Coursely — Milestones

> Complete implementation roadmap from spec to production.  
> Every task is granular and actionable. Follow the order within each milestone.

---

## Phase 0 — Project Scaffold

### M0.1 Initialize Repository & Monorepo

- [ ] Create project root with top-level `package.json` (workspaces: `apps/*`, `packages/*`)
- [ ] Set up `apps/web` (Next.js 15 + TypeScript)
- [ ] Set up `apps/api` (Express.js + TypeScript)
- [ ] Set up `packages/shared` (shared types, constants, Zod schemas)
- [ ] Create `.gitignore` (node_modules, dist, .env, prisma/generated, .next, coverage)
- [ ] Create `tsconfig.base.json` with path aliases shared across packages
- [ ] Run `git init` and initial commit

### M0.2 Tooling & Conventions

- [ ] Configure **ESLint** at root (flat config, shared rules for TS/React/Express)
- [ ] Configure **Prettier** (`npx prettier --write .` as format command)
- [ ] Configure **Husky** + **lint-staged** (lint + format on commit)
- [ ] Install and configure **commitlint** (conventional commits)
- [ ] Create `.env.example` files for `apps/web` and `apps/api`
- [ ] Install and configure **Docker Compose** for local PostgreSQL + Redis (if needed)
- [ ] Create `docker-compose.yml` with PostgreSQL service (port 5432)

### M0.3 CI Pipeline

- [ ] Create `.github/workflows/ci.yml`:
  ```yaml
  on: [push, pull_request]
  jobs:
    quality:
      runs-on: ubuntu-latest
      services:
        postgres:
          image: postgres:16
          env: { POSTGRES_DB: coursely_test, POSTGRES_PASSWORD: test }
      steps:
        - checkout, setup Node 20, install deps
        - run: npm run lint
        - run: npm run typecheck
        - run: npm run test:api
        - run: npm run test:web
  ```
- [ ] Add status badges to root README (once CI runs)

---

## Phase 1 — Database & Backend Core

### M1.1 Prisma Schema & Migrations

- [ ] Install `prisma` and `@prisma/client` in `apps/api`
- [ ] Create `prisma/schema.prisma` with all tables:

  ```prisma
  model User {
    id        String   @id @default(cuid())
    name      String
    email     String   @unique
    password  String
    role      Role     @default(STUDENT)
    createdAt DateTime @default(now())
    answers          Answer[]
    recommendations  Recommendation[]
  }
  enum Role { STUDENT ADMIN }

  model Department {
    id               String  @id @default(cuid())
    name             String  @unique
    faculty          String
    description      String
    cutoffMark       Int     @map("cutoff_mark")
    requiredSubjects String  @map("required_subjects") // JSON array
    difficultyLevel  String  @map("difficulty_level")
    careerPaths      String  @map("career_paths")      // JSON array
    studyDuration    String  @map("study_duration")
    scoringRules     ScoringRule[]
    recommendations  Recommendation[]
  }

  model Question {
    id       String      @id @default(cuid())
    question String
    category QuestionCategory
    type     QuestionType
    weight   Int         @default(1)
    answers  Answer[]
  }
  enum QuestionCategory { ACADEMIC CAREER PERSONALITY LEARNING_STYLE GOAL }
  enum QuestionType    { MULTIPLE_CHOICE SCALE TRUE_FALSE }

  model Answer {
    id         String   @id @default(cuid())
    userId     String   @map("user_id")
    questionId String   @map("question_id")
    answer     String
    score      Int
    user       User     @relation(fields: [userId], references: [id])
    question   Question @relation(fields: [questionId], references: [id])
  }

  model Recommendation {
    id               String   @id @default(cuid())
    userId           String   @map("user_id")
    departmentId     String   @map("department_id")
    compatibilityScore Float  @map("compatibility_score")
    breakdown        String   @default("{}") // JSON: factor -> score
    createdAt        DateTime @default(now())
    user             User     @relation(fields: [userId], references: [id])
    department       Department @relation(fields: [departmentId], references: [id])
  }

  model ScoringRule {
    id           String @id @default(cuid())
    departmentId String @map("department_id")
    factor       String
    weight       Int
    department   Department @relation(fields: [departmentId], references: [id])
  }
  ```

- [ ] Generate Prisma client (`npx prisma generate`)
- [ ] Run initial migration (`npx prisma migrate dev --name init`)
- [ ] Create `seed.ts` — seed UI departments (Medicine, CS, Engineering, Biochemistry, Physiology, Anatomy, Nursing, Pharmacy, etc.) with cutoff marks, required subjects, faculty, career paths
- [ ] Seed scoring rules for each department (factor → weight pairs from spec)
- [ ] Seed assessment questions (15–20 questions across categories)
- [ ] Set up Prisma client singleton in `apps/api/src/lib/prisma.ts`

### M1.2 Express.js Foundation

- [ ] Create `apps/api` with Express.js + TypeScript:
  ```
  apps/api/src/
    index.ts            (entrypoint — create app, listen)
    app.ts              (Express app setup — middleware, routes)
    lib/
      prisma.ts         (Prisma client singleton)
      jwt.ts            (JWT sign/verify helpers)
      errors.ts         (AppError class, error codes)
    middleware/
      auth.ts           (JWT authentication middleware)
      roles.ts          (role-based authorization)
      validate.ts       (Zod validation middleware)
      error-handler.ts  (global error handler)
      async-wrap.ts     (async route error wrapper)
    routes/
      auth.ts
      departments.ts
      questions.ts
      assessment.ts
      recommendations.ts
      admin.ts
    services/
      auth.service.ts
      department.service.ts
      question.service.ts
      assessment.service.ts
      recommendation.service.ts
      admin.service.ts
    schemas/            (Zod request/response schemas)
      auth.schema.ts
      department.schema.ts
      question.schema.ts
      assessment.schema.ts
      recommendation.schema.ts
  ```
- [ ] Set up `nodemon.json` and `tsconfig.json` for watch mode
- [ ] Add global middleware: `cors()`, `helmet()`, `express.json()`, `morgan()` logging
- [ ] Add Zod validation middleware — wraps `req.body/query/params` against schemas
- [ ] Add global error handler middleware (catch `AppError` subclasses, return consistent JSON)
- [ ] Add async route wrapper to avoid try/catch in every handler
- [ ] Configure environment validation with Zod (create `env.ts` schema)
- [ ] Add rate limiting with `express-rate-limit`
- [ ] Set up logging with Pino or `winston`

### M1.3 Authentication Module

- [ ] Install `jsonwebtoken`, `bcryptjs`
- [ ] Create JWT helper in `lib/jwt.ts` (sign, verify, decode)
- [ ] Create `POST /auth/register` — validate input with Zod schema, hash password, create user, return JWT
- [ ] Create `POST /auth/login` — validate credentials, return JWT + user info
- [ ] Create `POST /auth/logout` (stateless — client-side token removal; add blacklist if needed)
- [ ] Create `GET /auth/me` — return current user profile (requires auth middleware)
- [ ] Create `auth` middleware — extracts and verifies JWT, attaches `req.user`
- [ ] Create `roles` middleware — checks `req.user.role` against allowed roles
- [ ] Apply auth middleware to protected route groups, roles middleware to admin routes
- [ ] Write unit tests: auth service (register, login, hash comparison)
- [ ] Write e2e tests: `/auth/register` → `/auth/login` → access `/auth/me`

### M1.4 Departments Module

- [ ] Create `GET /departments` — list all departments
- [ ] Create `GET /departments/:id` — single department detail with scoring rules
- [ ] Create `POST /departments` (ADMIN only) — create department
- [ ] Create `PATCH /departments/:id` (ADMIN only) — update department
- [ ] Create `DELETE /departments/:id` (ADMIN only) — soft or hard delete
- [ ] Add filter query params: `?faculty=Science&difficulty=High`
- [ ] Write unit tests: department service CRUD
- [ ] Write e2e tests: admin creates → reads → updates → deletes department

### M1.5 Questions Module

- [ ] Create `GET /assessment/questions` — return all questions (ordered by category)
- [ ] Create `POST /admin/questions` (ADMIN only)
- [ ] Create `PATCH /admin/questions/:id` (ADMIN only)
- [ ] Create `DELETE /admin/questions/:id` (ADMIN only)
- [ ] Write tests: question CRUD

### M1.6 Assessment Module

- [ ] Create `POST /assessment/submit` — takes array of `{ questionId, answer }`, validates against stored questions, computes per-question score, stores Answer rows
- [ ] Create `GET /assessment/result/:id` — return user's assessment with scores per category
- [ ] Add validation: user cannot submit twice (check for existing answers)
- [ ] Return assessment ID for use in recommendation generation
- [ ] Write tests: submit assessment, retrieve result

### M1.7 Recommendation Engine (Core)

This is the most critical module. It must be **explainable**.

- [ ] Create `POST /recommendations/generate`:

  ```
  1. Fetch user's most recent assessment answers
  2. For each department:
     a. Load its scoring rules (factor → weight pairs)
     b. Map user's answers to relevant factors
     c. Compute weighted score per factor
     d. Sum weighted scores, normalize to 0–100
     e. Build breakdown per factor (for explainability)
  3. Sort departments by compatibility_score DESC
  4. Store Recommendation records with breakdown JSON
  5. Return sorted array with breakdowns
  ```

- [ ] Implement factor mapping logic (e.g., `mathematics_strength` maps to math-related questions):

  ```typescript
  // Example factor resolver
  const factorResolvers: Record<string, (answers: Answer[]) => number> = {
    mathematics_strength: (answers) => averageScore(answers, "math", "logic"),
    biology_strength: (answers) => averageScore(answers, "biology"),
    logical_reasoning: (answers) => averageScore(answers, "logic", "problem_solving"),
    communication_skill: (answers) => averageScore(answers, "communication"),
    interest_alignment: (answers) => averageScore(answers, "career_interest"),
    study_tolerance: (answers) => averageScore(answers, "study_tolerance"),
  };
  ```

- [ ] Create `GET /recommendations/:userId` — latest recommendations for a user
- [ ] Create `GET /recommendations/history` — paginated historical recommendations
- [ ] Add explainability endpoint: `GET /recommendations/:id/explain` returns per-factor breakdown for UI display
- [ ] Write unit tests:
  - Scoring formula correctness
  - Empty assessment edge case
  - Department with no scoring rules
  - All questions answered with max/min scores
- [ ] Test explainability output format

---

## Phase 2 — Frontend Core

### M2.1 Next.js Foundation

- [ ] Create `apps/web` with `create-next-app@latest` (App Router, TypeScript, Tailwind, ESLint)
- [ ] Install and configure `shadcn/ui` (`npx shadcn@latest init`)
  - Base color, CSS variables, global CSS setup
  - Add components as needed: Button, Card, Input, Label, Form, Select, Dialog, Table, Tabs, Progress, Badge, Avatar, Sheet, Separator
- [ ] Install `zustand`, `react-hook-form`, `@hookform/resolvers`, `zod`, `recharts`, `next-auth` or `@clerk/nextjs`
- [ ] Set up folder structure:
  ```
  apps/web/src/
    app/
      (public)/     landing, about, faq, contact
      (auth)/       login, signup, forgot-password
      (dashboard)/
        student/    home, assessment, results, saved, profile
        admin/      dashboard, departments, questions, rules, analytics
    components/
      ui/           shadcn components
      layout/       header, footer, sidebar, nav
      features/     assessment-form, result-chart, department-card
    lib/
      api.ts        fetched wrapper with auth headers
      utils.ts      cn(), formatScore(), etc.
    hooks/
      use-assessment.ts, use-recommendations.ts, use-auth.ts
    stores/
      auth-store.ts, assessment-store.ts
  ```
- [ ] Create API client (`lib/api.ts`) with base URL from env, automatic JWT header attachment, error handling
- [ ] Set up middleware (`src/middleware.ts`) for route protection:
  - `/dashboard/*` → redirect to login if unauthenticated
  - `/admin/*` → redirect if role !== ADMIN
- [ ] Configure `next.config.js` to allow backend API images/hosts if needed

### M2.2 Auth Store & Zustand

- [ ] Create `auth-store.ts`:
  ```typescript
  interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterInput) => Promise<void>;
    logout: () => void;
    fetchMe: () => Promise<void>;
  }
  ```
- [ ] Persist token in localStorage, hydrate on app load
- [ ] Create `assessment-store.ts` for multi-step form state

### M2.3 Public Pages

- [ ] **Landing Page** (`app/(public)/page.tsx`):
  - Hero section: headline + subtitle + CTA button ("Get Started")
  - How It Works: 3-step card layout (Answer questions → Get matched → Choose path)
  - Supported Departments: grid of department cards with icons
  - Testimonials carousel (static placeholder data)
  - Footer CTA: "Ready to find your path?"
- [ ] **About Page** (`app/(public)/about/page.tsx`):
  - Mission, Vision, Methodology sections
  - Transparency explanation (how recommendations work)
- [ ] **FAQ Page** (`app/(public)/faq/page.tsx`):
  - Accordion list of questions with answers
  - Categories: General, Assessment, Recommendations, Technical
- [ ] **Contact Page** (`app/(public)/contact/page.tsx`):
  - Form: Name, Email, Subject, Message
  - Validate with Zod, POST to backend contact endpoint
- [ ] Responsive design: mobile-first, test on 360px–1440px

### M2.4 Auth Pages

- [ ] **Sign Up** (`app/(auth)/signup/page.tsx`):
  - Fields: Full Name, Email, Password, Confirm Password
  - Zod schema: email format, password min 8 chars, passwords match
  - On success: store token, redirect to dashboard
  - Link to Login page
- [ ] **Login** (`app/(auth)/login/page.tsx`):
  - Fields: Email, Password
  - "Remember me" checkbox (optional — store token in cookie vs localStorage)
  - On success: store token, redirect to dashboard (or intended page)
  - Link to Sign Up + Forgot Password
- [ ] **Forgot Password** (`app/(auth)/forgot-password/page.tsx`):
  - Email field → send reset link (backend: generate reset token, email service)
  - Success message: "Check your email for reset instructions"
- [ ] Form UX: loading spinner on submit, inline field errors, disabled button while submitting

### M2.5 Student Dashboard Layout

- [ ] Create `app/(dashboard)/layout.tsx`:
  - Sidebar (collapsible on mobile) with nav items
  - Top bar with user avatar + name + logout button
  - Main content area
- [ ] Sidebar navigation:
  - Home (grid icon)
  - Assessment (clipboard icon)
  - My Results (chart icon)
  - Saved Recommendations (bookmark icon)
  - Profile (user icon)
- [ ] Responsive: sidebar becomes bottom tab bar on mobile (< 768px)

### M2.6 Dashboard Home

- [ ] Welcome card with user name
- [ ] Summary widget: latest recommendation if exists, otherwise "Take Assessment" prompt
- [ ] Quick stats: assessments taken, recommendations viewed, saved departments
- [ ] Recent activity feed (placeholder for now)

### M2.7 Assessment Flow

- [ ] **Intro Page** (`app/(dashboard)/assessment/page.tsx`):
  - Explanation of assessment: duration (~10 min), sections, scoring
  - "Start Assessment" button → transitions to questionnaire
  - If assessment already completed, show "View Results" and "Retake" options
- [ ] **Questionnaire** (`app/(dashboard)/assessment/questionnaire/page.tsx`):
  - Multi-step form (1 question per step or category-based steps)
  - Sections: Academic Performance → Career Interests → Personality → Learning Style → Goals
  - Progress bar showing current step / total steps
  - Question types: scale (1–5), multiple choice, true/false
  - Back/Next navigation with validation
  - Save progress per step (in Zustand store, persist to localStorage for resilience)
  - On final submit: POST to `/assessment/submit`
  - Loading spinner during submission
  - On success: redirect to Results page
- [ ] Form state managed by Zustand (`assessment-store.ts`) with persist middleware

### M2.8 Recommendation Results Page

- [ ] **Results page** (`app/(dashboard)/results/page.tsx`):
  - Fetch recommendations on mount: `GET /recommendations/:userId`
  - Display compatibility chart (Recharts horizontal bar chart):
    - Y-axis: department names
    - X-axis: percentage (0–100%)
    - Color-coded: green (≥70%), yellow (50–69%), red (<50%)
  - Below chart: per-department detail cards
- [ ] **Department card**:
  - Department name + badge with percentage
  - Faculty, difficulty level, typical cutoff
  - **Why this match?** — expandable breakdown showing per-factor scores:
    ```
    ┌──────────────────────────────────────┐
    │ Computer Science — 82%              │
    │──────────────────────────────────────│
    │ Strong match (good fit)              │
    │──────────────────────────────────────│
    │ Mathematics:      9/10  ━━━━━━━━━╸  │
    │ Logical Reasoning: 8/10  ━━━━━━━━╸   │
    │ Interest:          7/10  ━━━━━━━╸    │
    │ Biology:           4/10  ━━━━╸       │
    │ Study Tolerance:   6/10  ━━━━━━╸     │
    └──────────────────────────────────────┘
    ```
  - Save/bookmark button (toggle)
  - "View Details" link → Department Detail page
- [ ] **Alternative suggestions** section:
  - If top choice is competitive, show alternatives with lower cutoff expectations
  - Label: "Medicine is highly competitive — consider these alternatives:"
- [ ] Share results button (copy link or social share — Phase 2)

### M2.9 Department Detail Page

- [ ] `app/(dashboard)/departments/[id]/page.tsx`
- [ ] Fetch: `GET /departments/:id`
- [ ] Sections:
  - Overview (description, faculty, study duration)
  - Admission Requirements (O'level credits, JAMB subjects, cutoff mark)
  - Career Opportunities (list of career paths)
  - Difficulty level badge
  - Compatibility score module (if user has taken assessment)
- [ ] Back button to results

### M2.10 Saved Recommendations

- [ ] `app/(dashboard)/saved/page.tsx`
- [ ] Fetch saved departments for user
- [ ] Card grid layout, each card: department name, compatibility score, save date
- [ ] Un-save (remove) button
- [ ] Empty state: "You haven't saved any departments yet"

### M2.11 Profile Settings Page

- [ ] `app/(dashboard)/profile/page.tsx`
- [ ] View/edit: Name, Email (read-only), Password change
- [ ] Zod validation on form submission
- [ ] Success toast on update

---

## Phase 3 — Admin Dashboard

### M3.1 Admin Layout

- [ ] `app/(dashboard)/admin/layout.tsx` — sidebar nav:
  - Dashboard (overview)
  - Departments (CRUD)
  - Questions (CRUD)
  - Scoring Rules (manage)
  - Analytics (charts)
- [ ] Role guard: redirect non-ADMIN users to student dashboard

### M3.2 Admin Dashboard Page

- [ ] `app/(dashboard)/admin/page.tsx`
- [ ] Cards: total students, total assessments, total departments, total recommendations
- [ ] Recent registrations list
- [ ] Quick links to manage actions

### M3.3 Manage Departments (Admin CRUD)

- [ ] `app/(dashboard)/admin/departments/page.tsx` — table list with edit/delete buttons
- [ ] Create department form: name, faculty, description, cutoff, required subjects (JSON input), difficulty, career paths, study duration
- [ ] Edit department: pre-populate form, PATCH on submit
- [ ] Delete department: confirmation dialog
- [ ] Search/filter bar

### M3.4 Manage Questions (Admin CRUD)

- [ ] `app/(dashboard)/admin/questions/page.tsx` — table list grouped by category
- [ ] Create question form: question text, category (dropdown), type (dropdown), weight (number)
- [ ] Edit/delete with confirmation
- [ ] Bulk reorder by weight

### M3.5 Manage Scoring Rules (Admin CRUD)

- [ ] `app/(dashboard)/admin/rules/page.tsx`
- [ ] Select department → shows its scoring rules
- [ ] Add/edit/delete factor + weight pairs
- [ ] Warning: changing rules affects all future recommendations dynamically

### M3.6 Analytics Dashboard (Admin)

- [ ] `app/(dashboard)/admin/analytics/page.tsx`
- [ ] Charts:
  - Popular departments (bar chart — count of recommendations per dept)
  - Average compatibility scores per department
  - Assessment completion rate (pie chart)
  - Student registrations over time (line chart)
- [ ] Filters: date range, faculty

---

## Phase 4 — Testing & Quality ✅

### M4.1 Backend Tests ✅

- [x] Unit tests for recommendation engine formula with known inputs/outputs (25 tests)
- [x] E2E tests for all API endpoints using `supertest` + test database
- [x] Test setup: `beforeAll` creates test DB, `afterAll` drops
- [x] Test data factories for User, Department, Question, Answer
- [x] Run: `npm run test:api` (25 passing)

### M4.2 Frontend Tests ✅

- [x] Component tests with Vitest + React Testing Library (14 tests)
  - CompatibilityBreakdown renders labels/scores/bars
  - auth-store login/logout/set/loading
  - assessment-store step nav/setAnswer/reset
- [x] Run: `npm run test:web` (14 passing)

### M4.3 Integration Tests ✅

- [x] Full flow covered by `api.test.ts`: register → login → submit assessment → generate → view
- [x] Admin flow covered: admin login → create dept → verify via GET
- [x] Auth flow covered: unauthenticated user gets 401 on protected routes

### M4.4 Type Checking ✅

- [x] `npm run typecheck` passes in all 3 packages (shared, backend, frontend) — 0 errors
- [x] Configured as CI gate in `ci.yml`

### M4.5 Linting & Formatting ✅

- [x] `npm run lint` passes (0 errors, 6 acceptable warnings)
- [x] `npm run format:check` (Prettier) passes
- [x] lint-staged auto-fixes on commit (Husky `pre-commit` hook)

---

## Phase 5 — Deployment ✅

### M5.1 Production Readiness ✅

- [x] Audit all environment variables — documented in `.env.example` (root + backend + frontend)
- [x] Configure CORS for production domains — comma-separated origin list in `app.ts`
- [x] Rate limiting (`express-rate-limit`) — configured on `/api` routes
- [x] Helmet security headers — configured in `app.ts`
- [x] Structured request logging — Winston with JSON format in production
- [ ] Error tracking — Sentry (add if needed)
- [ ] Database connection pooling — PgBouncer (provision with Neon/Supabase)

### M5.2 Docker ✅

- [x] `backend/Dockerfile` — multi-stage (deps → build → runner), runs `prisma migrate deploy` + `node dist/index.js`
- [x] `frontend/Dockerfile` — standalone Next.js output (`output: "standalone"`), multi-stage
- [x] `docker-compose.prod.yml` — api + web + postgres services with env vars

### M5.3 CI/CD Pipeline ✅

- [x] `.github/workflows/deploy.yml` — runs CI quality checks, then deploys API to Railway + web to Vercel
- [x] CI workflow reuses `ci.yml` as reusable workflow (`uses:`)
- [x] Requires secrets: `RAILWAY_TOKEN`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

### M5.4 Deploy Backend (requires Railway/Render account)

- [x] Dockerfile ready — push context to Railway deploy
- [x] Environment variables documented in `.env.example`
- [ ] Push to Railway/Render dashboard
- [ ] Run `npx prisma migrate deploy` on production DB
- [ ] Run seed script
- [ ] Verify `/health` endpoint
- [ ] Domain setup

### M5.5 Deploy Frontend (requires Vercel account)

- [x] Standalone Next.js build configured (`output: "standalone"`)
- [x] Environment variables documented in `.env.example`
- [ ] Connect Vercel project to repo
- [ ] Set env vars in Vercel dashboard
- [ ] Configure custom domain
- [ ] Verify end-to-end flow

### M5.6 Database (requires Supabase/Neon account)

- [x] Connection string format documented
- [ ] Provision PostgreSQL instance
- [ ] Configure connection pooling
- [ ] Run production migrations

---

## Phase 6 — Post-MVP Polish

### M6.1 Enhanced Recommendation UI

- [ ] Animated chart transitions (enter/exit)
- [ ] Radar chart showing user strengths across categories
- [ ] PDF export of recommendation results
- [ ] "Share results" — shareable link with anonymized data

### M6.2 Notifications (optional)

- [ ] Email notification on assessment completion
- [ ] Email notification on new recommendations
- [ ] In-app notification bell (Phase 3)

### M6.3 Performance

- [ ] Lighthouse audit: target 90+ on Performance, Accessibility, SEO
- [ ] Image optimization (Next.js Image component)
- [ ] API response caching (Redis or in-memory for frequently accessed data)
- [ ] Implement ISR for public pages
- [ ] Lazy load chart components

### M6.4 Accessibility

- [ ] Run axe-core audit
- [ ] Keyboard navigation for all forms and interactive elements
- [ ] Screen reader labels on charts (Recharts accessible layer)
- [ ] Color contrast check (meet WCAG AA)
- [ ] Focus management in multi-step assessment form

### M6.5 SEO

- [ ] Meta tags for all public pages
- [ ] Structured data (JSON-LD) for departments
- [ ] Generate sitemap.xml
- [ ] robots.txt

---

## Phase 7 — Advanced Features (Future)

### M7.1 Multi-University Support

- [ ] Add `universities` table (id, name, location, type)
- [ ] Update `departments` table: `universityId` FK
- [ ] Add university admin roles
- [ ] Landing page: university selector
- [ ] Recommendation engine: filter by selected university

### M7.2 Art & Commercial Students

- [ ] Add Art/Commercial departments
- [ ] New question categories for arts/commercial streams
- [ ] O'level requirements for arts/commercial paths
- [ ] Expand scoring rules

### M7.3 WAEC/JAMB Prediction System

- [ ] Collect historical admission data (cutoff trends)
- [ ] ML-based cutoff prediction model (Phase 3 from spec)
- [ ] "Likelihood of admission" percentage based on historical data
- [ ] Disclaimer: predictive, not guaranteed

### M7.4 Scholarship Matching

- [ ] `scholarships` table
- [ ] Match students to scholarships based on department, grades, interests
- [ ] Scholarship detail pages

### M7.5 Advanced Personalization

- [ ] Adaptive assessment (questions change based on previous answers)
- [ ] ML-powered recommendations (collaborative filtering)
- [ ] "Students like you also considered..." suggestions

---

## Command Reference

```bash
# Development
npm run dev          # Start both frontend + backend concurrently
npm run dev:api      # nodemon / ts-node watch mode (http://localhost:4000)
npm run dev:web      # Next.js dev server (http://localhost:3000)

# Database
npm run db:migrate   # npx prisma migrate dev
npm run db:seed      # npx prisma db seed
npm run db:studio    # npx prisma studio
npm run db:reset     # npx prisma migrate reset

# Quality
npm run lint         # ESLint across all packages
npm run format       # Prettier write
npm run format:check # Prettier check (CI)
npm run typecheck    # tsc --noEmit across all packages

# Testing
npm run test:api     # Jest / Vitest for backend
npm run test:web     # Vitest + RTL for frontend
npm run test:e2e     # Full stack integration tests
npm run test         # All tests

# Build
npm run build:api    # TypeScript compile (tsc)
npm run build:web    # Next.js build
npm run build        # All packages
```

---

## Key Constraints (from spec)

| Rule                        | Detail                                                                            |
| --------------------------- | --------------------------------------------------------------------------------- |
| **Explainable**             | Every recommendation must include per-factor breakdown. No black-box.             |
| **O'level validation**      | Validate minimum credits, required science subjects, admission eligibility.       |
| **JAMB validation**         | Validate subject combinations, incorrect combinations, science eligibility.       |
| **Mobile-first**            | Target Android, unstable internet, low-mid range devices. Avoid heavy animations. |
| **Alternative suggestions** | If top department is competitive, always suggest alternatives.                    |
| **Transparency**            | Show why each department was recommended. Avoid fake AI complexity.               |
