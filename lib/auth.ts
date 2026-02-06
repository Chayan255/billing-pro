import "server-only";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

/**
 * Hash password (server only)
 */
export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

/**
 * Verify password (server only)
 */
export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

/**
 * Sign JWT (server only)
 */
export function signToken(payload: { userId: number; role: string }) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "1d",
  });
}

/**
 * Verify JWT (server only)
 */
export function verifyToken(token: string) {
  if (!token || token.split(".").length !== 3) {
    return null;
  }

  try {
    return jwt.verify(token, JWT_SECRET) as {
      userId: number;
      role: string;
    };
  } catch (error) {
    console.error("JWT Error:", error);
    return null;
  }
}
