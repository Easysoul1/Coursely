# Seed & Initial Setup — Changelog

## What was done

### 1. Fixed Docker startup to run migrations

**Problem:** The Dockerfile CMD was `node dist/index.js`, which bypassed the `prestart` hook (`prisma migrate deploy`). Database tables were never created, causing 500 errors on any Prisma query.

**Fix:**
- Created `backend/start.sh` entrypoint script that runs:
  1. `npx prisma migrate deploy` — applies pending migrations
  2. `npx tsx prisma/seed.ts` — seeds admin, departments, and questions
  3. `node dist/index.js` — starts the app
- Updated `backend/Dockerfile`:
  - Copies `prisma` CLI from the `build` stage (it's a devDependency, not available in production deps)
  - Uses `CMD ["/app/start.sh"]` instead of `CMD ["node", "dist/index.js"]`

### 2. Made seed script idempotent

**Problem:** Running seed twice would:
- Admin: safe (uses `upsert` by email)
- Departments: safe (uses `upsert` by name)
- Scoring rules: safe (uses `upsert` by composite ID)
- Questions: **NOT safe** — used `create()` with no unique constraint, would create duplicates

**Fix:** Added a guard — only creates questions if none exist:
```
if (await prisma.question.count() === 0) { create questions }
```

### 3. Moved `tsx` to production dependencies

**Problem:** `tsx` was a devDependency, so it wasn't available in the production Docker image. `npx tsx prisma/seed.ts` would fail.

**Fix:** Moved `tsx` from `devDependencies` to `dependencies` in `package.json`.

### 4. Admin credentials

| Field    | Value                  |
| -------- | ---------------------- |
| Email    | admin@coursely.com     |
| Password | admin123               |
| Role     | ADMIN                  |

### 5. Seeded data

| Entity      | Count |
| ----------- | ----- |
| Admin user  | 1     |
| Departments | 10    |
| Questions   | 20    |
| Rules       | 60    |

### Departments seeded

1. Medicine & Surgery (Medicine)
2. Computer Science (Science)
3. Electrical & Electronics Engineering (Engineering)
4. Biochemistry (Science)
5. Physiology (Medicine)
6. Anatomy (Medicine)
7. Nursing (Medicine)
8. Pharmacy (Pharmacy)
9. Mechanical Engineering (Engineering)
10. Statistics (Science)

### Question categories (20 total)

- ACADEMIC (4) — subject performance
- CAREER (4) — career interests
- PERSONALITY (4) — traits & preferences
- LEARNING_STYLE (4) — study habits
- GOAL (4) — academic goals

## How to deploy

1. Go to **Render Dashboard** → your backend service
2. Click **Manual Deploy** → **Deploy latest commit**
3. Watch the build logs — `start.sh` will:
   - Run migrations (creates tables)
   - Run seed script (creates admin, departments, questions)
   - Start the Express API
4. Verify by hitting `GET https://coursely-jcw2.onrender.com/api/questions`
5. Login at the frontend with `admin@coursely.com` / `admin123`

## Files changed

| File                            | Change                         |
| ------------------------------- | ------------------------------ |
| `backend/start.sh`              | **New** — entrypoint script    |
| `backend/Dockerfile`            | Use start.sh, copy prisma CLI  |
| `backend/package.json`          | Moved tsx to deps              |
| `backend/package-lock.json`     | Updated                        |
| `backend/prisma/seed.ts`        | Guard question creation        |
