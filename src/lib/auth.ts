import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "./db";

export async function getOrCreateUser() {
  const { userId } = await auth();
  if (!userId) return null;

  // Try to find existing user
  let user = await db.user.findUnique({ where: { id: userId } });
  if (user) return user;

  // Auto-create from Clerk if webhook hasn't fired yet
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;

  user = await db.user.upsert({
    where: { id: userId },
    create: { id: userId, email, name },
    update: {},
  });

  return user;
}
