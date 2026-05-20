# Coursely — AGENTS.md

## State

Pre-implementation. The repo contains only the spec document:
`coursely_ui_career_guidance_platform.md`

No code, no package.json, no build/test/lint commands, no CI, no git history yet.

## Domain

Nigerian academic career guidance web app. Targets science students seeking admission to **University of Ibadan (UI)**. Recommends departments based on O'level results, JAMB subjects, career interests, personality traits, and department competitiveness. Uses explainable rule-based scoring (not ML).

## Recommended Stack (from spec)

| Layer    | Technology                                           |
| -------- | ---------------------------------------------------- |
| Frontend | Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui   |
| State    | Zustand                                              |
| Forms    | React Hook Form + Zod                                |
| Charts   | Recharts                                             |
| Backend  | Express.js                                           |
| DB       | PostgreSQL + Prisma                                  |
| Auth     | Auth.js or Clerk                                     |
| Hosting  | Vercel (FE), Railway/Render (BE), Supabase/Neon (DB) |

## Planned Structure

- **Frontend pages**: Landing, About, FAQ, Contact, Auth (signup/login/forgot), Student dashboard (assessment, results, saved recs, profile), Admin (CRUD depts/questions/rules, analytics)
- **API modules**: Auth, Assessment, Recommendations, Departments, Admin/Analytics
- **DB tables**: `users`, `departments`, `questions`, `answers`, `recommendations`, `scoring_rules`

## Key Convention

The recommendation engine must be **explainable** — output compatibility percentages with per-factor breakdowns. No black-box ML.
