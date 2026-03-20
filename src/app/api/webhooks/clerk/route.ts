import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { db } from "@/lib/db";

interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses: Array<{ email_address: string }>;
    first_name?: string;
    last_name?: string;
  };
}

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const body = await req.text();

  const wh = new Webhook(WEBHOOK_SECRET);
  let event: ClerkWebhookEvent;

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "user.created" || event.type === "user.updated") {
    const { id, email_addresses, first_name, last_name } = event.data;
    const email = email_addresses[0]?.email_address;
    if (!email) return NextResponse.json({ error: "No email" }, { status: 400 });

    const name = [first_name, last_name].filter(Boolean).join(" ") || null;

    await db.user.upsert({
      where: { id },
      create: { id, email, name },
      update: { email, name },
    });
  }

  if (event.type === "user.deleted") {
    await db.user.delete({ where: { id: event.data.id } }).catch(() => {});
  }

  return NextResponse.json({ received: true });
}
