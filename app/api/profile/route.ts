import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  const user = await getAuthUser();

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      name: true,
      email: true,
      businessName: true,
      companyGstin: true,
      companyAddress: true,
      companyState: true,
      companyStateCode: true,
    },
  });

  return NextResponse.json(profile);
}

export async function PUT(req: Request) {
  const user = await getAuthUser();
  const body = await req.json();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      businessName: body.businessName,
      companyGstin: body.companyGstin || null,
      companyAddress: body.companyAddress || null,
      companyState: body.companyState || null,
      companyStateCode: body.companyStateCode || null,
    },
  });

  return NextResponse.json({ success: true });
}
