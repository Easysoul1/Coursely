import bcrypt from "bcryptjs";
import request from "supertest";
import app from "../app";
import { PrismaClient } from "@prisma/client";
import { cleanupDatabase } from "./factories";

const prisma = new PrismaClient();

describe("API E2E", () => {
  let token: string;
  let adminToken: string;
  let departmentId: string;
  let questionId: string;

  beforeAll(async () => {
    await cleanupDatabase();
  });

  afterAll(async () => {
    await cleanupDatabase();
    await prisma.$disconnect();
  });

  describe("Auth", () => {
    it("POST /api/auth/register - creates a new user", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ name: "Test Student", email: "student@test.com", password: "password123" })
        .expect(201);

      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe("student@test.com");
      expect(res.body.user.role).toBe("STUDENT");
      expect(res.body.token).toBeDefined();
      token = res.body.token;
    });

    it("POST /api/auth/register - rejects duplicate email", async () => {
      await request(app)
        .post("/api/auth/register")
        .send({ name: "Test Student", email: "student@test.com", password: "password123" })
        .expect(409);
    });

    it("POST /api/auth/login - authenticates user", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "student@test.com", password: "password123" })
        .expect(200);

      expect(res.body.token).toBeDefined();
    });

    it("POST /api/auth/login - rejects wrong password", async () => {
      await request(app)
        .post("/api/auth/login")
        .send({ email: "student@test.com", password: "wrongpassword" })
        .expect(401);
    });

    it("GET /api/auth/me - returns user profile", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body.user.email).toBe("student@test.com");
    });

    it("GET /api/auth/me - rejects without token", async () => {
      await request(app).get("/api/auth/me").expect(401);
    });
  });

  describe("Departments", () => {
    beforeAll(async () => {
      await prisma.department.create({
        data: {
          name: "Test Department",
          faculty: "Science",
          description: "A department for testing.",
          cutoffMark: 200,
          requiredSubjects: JSON.stringify(["English", "Mathematics"]),
          difficultyLevel: "Medium",
          careerPaths: JSON.stringify(["Test Career"]),
          studyDuration: "4 years",
        },
      });
    });

    it("GET /api/departments - lists departments", async () => {
      const res = await request(app).get("/api/departments").expect(200);

      expect(Array.isArray(res.body.departments)).toBe(true);
      expect(res.body.departments.length).toBeGreaterThan(0);
    });

    it("GET /api/departments/:id - returns department detail", async () => {
      const listRes = await request(app).get("/api/departments");
      departmentId = listRes.body.departments[0]?.id;

      if (departmentId) {
        const res = await request(app).get(`/api/departments/${departmentId}`).expect(200);
        expect(res.body.department).toBeDefined();
      }
    });
  });

  describe("Questions", () => {
    it("GET /api/questions - lists all questions", async () => {
      const res = await request(app).get("/api/questions").expect(200);
      expect(Array.isArray(res.body.questions)).toBe(true);
    });
  });

  describe("Admin CRUD", () => {
    beforeAll(async () => {
      const hashed = await bcrypt.hash("adminpass123", 1);
      await prisma.user.upsert({
        where: { email: "admin@test.com" },
        update: { role: "ADMIN" },
        create: {
          name: "Admin User",
          email: "admin@test.com",
          password: hashed,
          role: "ADMIN",
        },
      });

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "admin@test.com", password: "adminpass123" })
        .expect(200);

      adminToken = res.body.token;
    });

    it("POST /api/departments - admin creates department", async () => {
      const res = await request(app)
        .post("/api/departments")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: `Admin Created Dept ${Date.now()}`,
          faculty: "Science",
          description: "A department for testing admin CRUD.",
          cutoffMark: 200,
          requiredSubjects: JSON.stringify(["English", "Mathematics"]),
          difficultyLevel: "Medium",
          careerPaths: JSON.stringify(["Researcher"]),
          studyDuration: "4 years",
        })
        .expect(201);

      expect(res.body.department.name).toContain("Admin Created Dept");
      departmentId = res.body.department.id;
    });

    it("PATCH /api/departments/:id - admin updates department", async () => {
      const res = await request(app)
        .patch(`/api/departments/${departmentId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Updated Department" })
        .expect(200);

      expect(res.body.department.name).toBe("Updated Department");
    });

    it("DELETE /api/departments/:id - admin deletes department", async () => {
      await request(app)
        .delete(`/api/departments/${departmentId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(204);
    });

    it("POST /api/questions - admin creates question", async () => {
      const res = await request(app)
        .post("/api/questions")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          question: "Test question?",
          category: "ACADEMIC",
          type: "SCALE",
          weight: 2,
        })
        .expect(201);

      questionId = res.body.question.id;
    });

    it("PATCH /api/questions/:id - admin updates question", async () => {
      const res = await request(app)
        .patch(`/api/questions/${questionId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ question: "Updated question?" })
        .expect(200);

      expect(res.body.question.question).toBe("Updated question?");
    });

    it("DELETE /api/questions/:id - admin deletes question", async () => {
      await request(app)
        .delete(`/api/questions/${questionId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(204);
    });

    it("POST /api/departments - rejects non-admin user", async () => {
      await request(app)
        .post("/api/departments")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Unauthorized Dept",
          faculty: "Science",
          description: "Should not be created.",
          cutoffMark: 200,
          requiredSubjects: JSON.stringify(["English"]),
          difficultyLevel: "Low",
          careerPaths: JSON.stringify(["Job"]),
          studyDuration: "4 years",
        })
        .expect(403);
    });
  });

  interface TestQuestion {
    id: string;
    question: string;
    category: string;
    type: string;
    weight: number;
  }

  describe("Full Assessment & Recommendation Flow", () => {
    let assessmentQuestions: TestQuestion[];

    beforeAll(async () => {
      await prisma.question.createMany({
        data: [
          { question: "Rate your math skills", category: "ACADEMIC", type: "SCALE", weight: 3 },
          { question: "Rate your biology skills", category: "ACADEMIC", type: "SCALE", weight: 3 },
          {
            question: "Interest in healthcare career?",
            category: "CAREER",
            type: "SCALE",
            weight: 2,
          },
          { question: "Interest in tech career?", category: "CAREER", type: "SCALE", weight: 2 },
          {
            question: "Do you enjoy problem solving?",
            category: "PERSONALITY",
            type: "SCALE",
            weight: 2,
          },
        ],
      });

      const res = await request(app).get("/api/assessment/questions").expect(200);
      assessmentQuestions = res.body.questions;
    });

    it("completes full assessment → result → recommendations flow", async () => {
      expect(assessmentQuestions.length).toBeGreaterThan(0);

      // Submit assessment
      const answers = assessmentQuestions.slice(0, 3).map((q) => ({
        questionId: q.id,
        answer: "5",
        score: 7,
      }));

      const submitRes = await request(app)
        .post("/api/assessment/submit")
        .set("Authorization", `Bearer ${token}`)
        .send({ answers })
        .expect(201);

      expect(submitRes.body.message).toBe("Assessment submitted successfully");

      const meRes = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      const userId = meRes.body.user.id;

      const resultRes = await request(app)
        .get(`/api/assessment/result/${userId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(resultRes.body.result.categories).toBeDefined();
      expect(resultRes.body.result.categories.length).toBeGreaterThan(0);

      const recRes = await request(app)
        .post("/api/recommendations/generate")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(recRes.body.recommendations).toBeDefined();
      expect(recRes.body.recommendations.length).toBeGreaterThan(0);
      expect(recRes.body.recommendations[0].compatibilityScore).toBeDefined();
      expect(recRes.body.recommendations[0].breakdown).toBeDefined();
    });

    it("rejects duplicate assessment submission", async () => {
      const answers = [{ questionId: assessmentQuestions[0].id, answer: "5", score: 5 }];

      await request(app)
        .post("/api/assessment/submit")
        .set("Authorization", `Bearer ${token}`)
        .send({ answers })
        .expect(400);
    });
  });

  describe("Health", () => {
    it("GET /health - returns ok status", async () => {
      const res = await request(app).get("/health").expect(200);
      expect(res.body.status).toBe("ok");
    });
  });
});
