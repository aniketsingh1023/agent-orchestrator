import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { db } from "@/lib/db";

const schema = z.object({
  email: z.email(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  try {
    await db.waitlist.create({ data: { email: parsed.data.email } });
  } catch {
    // Unique constraint — already on waitlist
    return NextResponse.json({ message: "You're already on the list!" });
  }

  return NextResponse.json({ message: "You're in! We'll reach out soon." }, { status: 201 });
}
