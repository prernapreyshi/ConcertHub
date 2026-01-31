import { getDatabase } from "@/lib/mongodb";
import { hashPassword, signToken } from "@/lib/auth";
import type { User } from "@/lib/models/user";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();
  const db = await getDatabase();

  const existing = await db.collection<User>("users").findOne({ email });
  if (existing) {
    return Response.json({ error: "User exists" }, { status: 400 });
  }

  const hashed = await hashPassword(password);

  const user: User = {
    name,
    email,
    password: hashed,
    createdAt: new Date(),
  };

  const result = await db.collection<User>("users").insertOne(user);

  const token = signToken({
    userId: result.insertedId.toString(),
    email,
  });

  // ✅ FINAL FIX
  const cookieStore = await cookies();
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  return Response.json({
    user: { id: result.insertedId.toString(), name, email },
  });
}
