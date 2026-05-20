# Coursely

## Project Overview

Coursely is a web-based academic career decision support system designed specifically for Nigerian secondary school graduates seeking admission into Nigerian universities.

The first release focuses on:

- Science students
- Aspirants of the University of Ibadan (UI)
- Department recommendation and compatibility analysis

The platform evaluates:

- Academic strengths
- Subject performance
- Career interests
- Personality traits
- Learning preferences
- Department competitiveness

The system then generates department recommendations with compatibility percentages.

Example:

| Department         | Compatibility |
| ------------------ | ------------- |
| Computer Science   | 82%           |
| Medicine & Surgery | 58%           |
| Biochemistry       | 67%           |

The recommendation engine is explainable and rule-based instead of black-box AI.

---

# Why “Coursely”

The name is:

- Simple
- Memorable
- Educational
- Modern
- Startup-friendly
- Easy to brand
- Easy to pronounce in Nigeria

It directly connects to:

- Courses
- Academic direction
- Educational pathways

It also scales well beyond University of Ibadan.

Potential future branding:

- Coursely AI
- Coursely Campus
- Coursely Scholar
- Coursely Career Engine

---

# Product Vision

To help Nigerian secondary school graduates make informed academic and career decisions using structured assessment and intelligent recommendations.

---

# Target Users

Primary Users:

- Nigerian science students
- Secondary school leavers
- JAMB candidates
- UI aspirants

Secondary Users:

- Parents
- Guidance counselors
- Tutorial centers
- Schools

---

# Problem Statement

Many Nigerian students:

- Choose departments blindly
- Follow peer pressure
- Follow parental pressure
- Lack proper career guidance
- Do not understand admission competitiveness
- Ignore subject strengths and weaknesses

This leads to:

- Poor academic performance
- Course switching
- Loss of motivation
- University dropout
- Wasted admission opportunities

Current solutions are:

- Manual
- Inconsistent
- Generic
- Non-localized
- Not scalable

Coursely solves this through a structured web-based decision support system.

---

# Core Features

## 1. Student Assessment System

Students answer questions related to:

- Subject strengths
- Career interests
- Logical reasoning
- Learning preferences
- Academic goals
- Study tolerance
- Personality traits

---

## 2. Department Recommendation Engine

The platform generates:

- Department recommendations
- Compatibility percentages
- Alternative departments
- Explanation for recommendations

Example:

```json
[
  {
    "department": "Computer Science",
    "score": 82
  },
  {
    "department": "Medicine",
    "score": 58
  }
]
```

---

## 3. JAMB Subject Combination Validation

The platform validates:

- JAMB subject combinations
- O’level requirements
- Compulsory science subjects

Example:

Medicine requires:

- English
- Biology
- Chemistry
- Physics

---

## 4. Alternative Department Recommendation

Example:

If Medicine is too competitive:

Recommended alternatives:

- Physiology
- Anatomy
- Biochemistry

---

## 5. University Information System

Each department page contains:

- Department description
- Typical cutoff marks
- O’level requirements
- JAMB subject combinations
- Faculty information
- Career opportunities
- Study duration
- Difficulty level

---

## 6. Admin Dashboard

Admins can:

- Manage departments
- Update scoring rules
- Manage questions
- View analytics
- Monitor recommendations

---

# Similar Existing Platforms

## MyMajors

Website:
https://www.mymajors.com

Strengths:

- Academic recommendation engine
- Interest-based matching

Weaknesses:

- Not Nigerian-focused
- No JAMB logic
- No university admission feasibility system

---

## CareerExplorer

Website:
https://www.careerexplorer.com

Strengths:

- Advanced personality matching
- Strong recommendation engine

Weaknesses:

- Too broad
- No Nigerian admission structure

---

## UCAS

Website:
https://www.ucas.com

Strengths:

- Structured educational guidance
- University pathway management

Weaknesses:

- UK-focused
- No local Nigerian educational mapping

---

## Nigerian Alternatives

Current Nigerian alternatives are fragmented:

- Myschool.ng
- Schoolnews
- JAMB forums
- YouTube guidance channels

None combine:

- Academic profiling
- Admission feasibility
- Subject strength analysis
- Explainable recommendations
- Nigerian university intelligence

Coursely fills this gap.

---

# Technical Architecture

## System Architecture

```text
Client → API → Recommendation Engine → Database
```

---

# Recommended Tech Stack

## Frontend

### Framework

- Next.js 15
- TypeScript

Reason:

- SEO support
- Fast rendering
- Scalable architecture
- Excellent developer experience

---

### Styling

- Tailwind CSS

Reason:

- Fast UI development
- Responsive design
- Nigerian startup ecosystem standard

---

### Component Library

- shadcn/ui

Reason:

- Modern UI
- Accessible components
- Professional design system

---

### State Management

- Zustand

Reason:

- Lightweight
- Simple global state management

---

### Form Handling

- React Hook Form
- Zod

Reason:

- Excellent validation
- High performance forms

---

### Charts

- Recharts

Reason:

- Recommendation visualization
- Compatibility analytics

---

# Backend

## Framework

- NestJS

Reason:

- Modular architecture
- Enterprise structure
- Strong TypeScript support
- Excellent scalability

---

# Database

## Database Engine

- PostgreSQL

Reason:

- Relational structure
- Strong querying
- Reliable performance

---

## ORM

- Prisma

Reason:

- Type safety
- Rapid development
- Clean schema management

---

# Authentication

## Recommended

- Auth.js

Alternative:

- Clerk

---

# Hosting

## Frontend

- Vercel

## Backend

- Railway
- Render

## Database

- Supabase PostgreSQL
- Neon PostgreSQL

---

# Core System Modules

## 1. Authentication Module

Responsibilities:

- Registration
- Login
- Session management
- Access control

---

## 2. Assessment Module

Responsibilities:

- Questionnaire management
- Student profiling
- Assessment submission

---

## 3. Recommendation Engine

Responsibilities:

- Weighted scoring
- Department ranking
- Compatibility analysis
- Recommendation generation

---

## 4. Department Knowledge Base

Responsibilities:

- Department information
- Admission requirements
- Cutoff management
- Subject mapping

---

## 5. Analytics Module

Responsibilities:

- Student trends
- Popular departments
- Recommendation statistics
- Assessment analytics

---

## 6. Admin Module

Responsibilities:

- Manage departments
- Manage questions
- Manage scoring rules
- Monitor usage

---

# Recommendation Engine Design

## Recommendation Factors

Each department receives weighted scores.

Example:

| Factor               | Weight |
| -------------------- | ------ |
| Mathematics Strength | 25     |
| Biology Strength     | 20     |
| Logical Reasoning    | 15     |
| Communication Skill  | 10     |
| Interest Alignment   | 20     |
| Study Tolerance      | 10     |

Total = 100

---

# Department Weighting Examples

## Medicine

High weights:

- Biology
- Chemistry
- Discipline
- Long study tolerance

---

## Computer Science

High weights:

- Mathematics
- Problem solving
- Logical reasoning
- Curiosity

---

## Engineering

High weights:

- Physics
- Mathematics
- Technical reasoning

---

# Recommendation Formula

```text
(score_obtained / max_possible_score) * 100
```

---

# Frontend Pages

# Public Pages

## 1. Landing Page

Sections:

- Hero section
- How it works
- Supported departments
- Testimonials
- CTA section

---

## 2. About Page

Contains:

- Mission
- Vision
- Methodology
- Transparency explanation

---

## 3. FAQ Page

Contains common questions.

Examples:

- Does this guarantee admission?
- Is this affiliated with UI?
- How are recommendations generated?

---

## 4. Contact Page

Simple contact form.

---

# Authentication Pages

## 5. Sign Up Page

---

## 6. Login Page

---

## 7. Forgot Password Page

---

# Student Dashboard Pages

## 8. Dashboard Home

Displays:

- Latest recommendations
- Assessment status
- Saved departments

---

## 9. Assessment Intro Page

Explains:

- Duration
- Scoring system
- Assessment process

---

## 10. Assessment Questionnaire Page

Multi-step assessment form.

Sections:

- Academic performance
- Interests
- Personality
- Learning style
- Career goals

---

## 11. Recommendation Result Page

Displays:

- Department compatibility percentages
- Explanation of results
- Alternative departments
- Charts and analytics

Example:

```text
Computer Science — 82%

Why:
- Strong mathematics performance
- High logical reasoning
- Strong interest in technology
```

---

## 12. Department Detail Page

Displays:

- O’level requirements
- JAMB subject combination
- Typical cutoff mark
- Career opportunities
- Department overview

---

## 13. Saved Recommendations Page

Students can bookmark departments.

---

## 14. Profile Settings Page

Student profile management.

---

# Admin Pages

## 15. Admin Dashboard

---

## 16. Manage Departments Page

CRUD operations for departments.

---

## 17. Manage Questions Page

Assessment question management.

---

## 18. Manage Scoring Rules Page

Controls recommendation logic.

---

## 19. Analytics Dashboard

Displays:

- Popular departments
- Average compatibility scores
- Student behavior analytics

---

# Backend API Design

# Authentication Endpoints

```http
POST /auth/register
POST /auth/login
POST /auth/logout
GET  /auth/me
```

---

# Assessment Endpoints

```http
GET    /assessment/questions
POST   /assessment/submit
GET    /assessment/result/:id
```

---

# Recommendation Endpoints

```http
POST   /recommendations/generate
GET    /recommendations/:userId
GET    /recommendations/history
```

---

# Department Endpoints

```http
GET    /departments
GET    /departments/:id
POST   /departments
PATCH  /departments/:id
DELETE /departments/:id
```

---

# Admin Endpoints

```http
GET    /admin/analytics
POST   /admin/questions
PATCH  /admin/questions/:id
DELETE /admin/questions/:id
```

---

# Database Design

# users

```sql
id
name
email
password
role
created_at
```

---

# departments

```sql
id
name
faculty
description
cutoff_mark
required_subjects
difficulty_level
career_paths
```

---

# questions

```sql
id
question
category
type
weight
```

---

# answers

```sql
id
user_id
question_id
answer
score
```

---

# recommendations

```sql
id
user_id
department_id
compatibility_score
created_at
```

---

# scoring_rules

```sql
id
department_id
factor
weight
```

---

# Nigerian-Specific Features

## 1. JAMB Subject Combination Checker

Validates:

- Required subjects
- Incorrect combinations
- Science eligibility

---

## 2. O’Level Validation

Checks:

- Minimum credits
- Required science subjects
- Admission eligibility

---

## 3. UI Cutoff Intelligence

Example:

```text
Your compatibility for Computer Science is HIGH.

Reason:
Your profile aligns strongly with recent admission expectations.
```

---

## 4. Alternative Department Suggestions

Critical feature for Nigerian admission reality.

Example:

```text
Medicine is highly competitive.

Alternative recommendations:
- Physiology
- Anatomy
- Biochemistry
```

---

# UI/UX Direction

The platform should prioritize:

- Mobile-first design
- Fast loading
- Simplicity
- Accessibility
- Low data usage

Most Nigerian students:

- Use Android devices
- Have unstable internet
- Use low-mid range devices

Avoid:

- Heavy animations
- Excessive graphics
- Complex layouts

Use:

- Clean cards
- Progress indicators
- Step-by-step flows
- Simple navigation

---

# MVP Development Plan

# Phase 1

Build:

- Authentication
- Assessment system
- Recommendation engine
- Department pages

Ignore:

- AI/ML
- Notifications
- Advanced analytics
- Social features

---

# Phase 2

Add:

- Admin dashboard
- Analytics
- Saved recommendations
- Better visualizations

---

# Phase 3

Add:

- Machine learning
- Adaptive recommendations
- Historical trend analysis
- WAEC/JAMB prediction systems
- Multi-university support

---

# Critical Engineering Principle

The biggest technical risk is recommendation credibility.

If recommendations feel:

- Random
- Inconsistent
- Unrealistic
- Non-transparent

Users will lose trust.

Therefore:

- Keep the recommendation engine explainable
- Show WHY departments were recommended
- Avoid black-box behavior
- Prioritize transparency over fake AI complexity

---

# Future Expansion

After validating the MVP:

- Add Art students
- Add Commercial students
- Add other Nigerian universities
- Add Polytechnic support
- Add scholarship matching
- Add AI personalization
- Add historical admission prediction

---

# Final Positioning

Coursely is not just another educational website.

It is a Nigerian academic decision support platform designed to help students make informed university and career decisions using structured assessments and transparent recommendation systems.
