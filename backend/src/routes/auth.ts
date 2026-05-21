import crypto from "crypto";
import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { createClerkClient, verifyToken } from "@clerk/backend";
import { prisma } from "../lib/prisma";
import { signToken } from "../lib/jwt";
import { asyncWrap } from "../middleware/async-wrap";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/auth";
import { registerSchema, loginSchema, updateProfileSchema } from "../schemas/auth.schema";
import { ConflictError, UnauthorizedError, NotFoundError } from "../lib/errors";
import { env } from "../lib/env";

const clerkClient = env.CLERK_SECRET_KEY
  ? createClerkClient({ secretKey: env.CLERK_SECRET_KEY })
  : null;

const router = Router();

router.post(
  "/register",
  validate({ body: registerSchema }),
  asyncWrap(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictError("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    const token = signToken({ userId: user.id, role: user.role });

    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    });
  }),
);

router.post(
  "/login",
  validate({ body: loginSchema }),
  asyncWrap(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const token = signToken({ userId: user.id, role: user.role });

    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    });
  }),
);

router.post(
  "/clerk-exchange",
  asyncWrap(async (req: Request, res: Response) => {
    if (!clerkClient) {
      throw new UnauthorizedError("Clerk is not configured on the server");
    }

    const { clerkToken } = req.body;
    if (!clerkToken) {
      throw new UnauthorizedError("Clerk token is required");
    }

    let clerkUserId: string;
    try {
      const payload = (await verifyToken(clerkToken, {
        secretKey: env.CLERK_SECRET_KEY!,
      })) as { sub: string };
      clerkUserId = payload.sub;
    } catch {
      throw new UnauthorizedError("Invalid or expired Clerk session token");
    }

    let clerkUser: Awaited<ReturnType<typeof clerkClient.users.getUser>>;
    try {
      clerkUser = await clerkClient.users.getUser(clerkUserId);
    } catch {
      throw new UnauthorizedError("Failed to fetch user from Clerk");
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress || "";
    const name = clerkUser.fullName || clerkUser.firstName || clerkUser.username || "User";
    const role = (clerkUser.publicMetadata?.role as string) === "ADMIN" ? "ADMIN" : "STUDENT";

    let user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });

    if (!user && email) {
      user = await prisma.user.findUnique({ where: { email } });
    }

    if (user) {
      const updates: Record<string, unknown> = {};
      if (user.name !== name) updates.name = name;
      if (user.email !== email) updates.email = email;
      if (!user.clerkId) updates.clerkId = clerkUserId;
      if (user.role !== role) updates.role = role;
      if (Object.keys(updates).length > 0) {
        user = await prisma.user.update({ where: { id: user.id }, data: updates as any });
      }
    } else {
      const hashedPassword = await bcrypt.hash(crypto.randomUUID(), 12);
      user = await prisma.user.create({
        data: {
          clerkId: clerkUserId,
          name,
          email: email || `user-${clerkUserId.slice(0, 8)}@placeholder.coursely.app`,
          password: hashedPassword,
          role,
        },
      });
    }

    const token = signToken({ userId: user.id, role: user.role });

    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    });
  }),
);

router.post("/logout", (_req: Request, res: Response) => {
  res.json({ message: "Logged out successfully" });
});

router.get(
  "/me",
  authenticate,
  asyncWrap(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    res.json({ user });
  }),
);

router.patch(
  "/me",
  authenticate,
  validate({ body: updateProfileSchema }),
  asyncWrap(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    });
    if (!user) throw new NotFoundError("User");

    const updated = await prisma.user.update({
      where: { id: req.user!.userId },
      data: req.body,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    res.json({ user: updated });
  }),
);

export default router;
