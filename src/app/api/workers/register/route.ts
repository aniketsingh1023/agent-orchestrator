import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import { db } from "@/lib/db";

// POST /api/workers/register — Register a new CLI worker
// Called from dashboard. Returns an API key the CLI uses to authenticate.
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const name = body.name || `worker-${Date.now()}`;

  // Generate a secure API key for this worker
  const apiKey = `ctrlai_${crypto.randomBytes(32).toString("hex")}`;

  const worker = await db.worker.create({
    data: {
      name,
      apiKey,
      userId,
      status: "OFFLINE",
    },
  });

  return NextResponse.json({
    workerId: worker.id,
    name: worker.name,
    apiKey, // Only returned once at registration
  }, { status: 201 });
}

// GET /api/workers — List workers for current user
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workers = await db.worker.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      status: true,
      lastPingAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(workers);
}
