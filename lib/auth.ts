import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: { userId: number; role: string }) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "1d",
  });
}

export function verifyToken(token: string) {
  // basic JWT shape check
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
