import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

export interface JwtPayload {
  userId: string;
  role: string;
}

export function signToken(payload: JwtPayload): string {
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign(payload as object, SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload;
}
