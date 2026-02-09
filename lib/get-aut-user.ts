import "server-only";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db";
import type { Role, BusinessType, User } from "@prisma/client";

type JwtPayload = {
  userId: number;
  role: Role;
  businessType: BusinessType;
  iat?: number;
  exp?: number;
};

export async function verifyToken(token: string): Promise<User | null> {
  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    if (!payload?.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    return user;
  } catch (err) {
    return null;
  }
}