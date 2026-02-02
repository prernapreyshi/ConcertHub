export const runtime = "nodejs";

import { getDatabase } from "@/lib/mongodb";
import { hashPassword, signToken } from "@/lib/auth";
import type { User } from "@/lib/models/user";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    // 1️⃣ Parse body
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return Response.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }

    // 2️⃣ DB
    const db = await getDatabase();

    // 3️⃣ Check if user already exists
    const existing = await db
      .collection<User>("users")
      .findOne({ email });

    if (existing) {
      return Response.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // 4️⃣ Hash password
    const passwordHash = await hashPassword(password);

    // 5️⃣ Create user object
    const user: User = {
      name,
      email,
      passwordHash,
      createdAt: new Date(),
    };

    // 6️⃣ Insert into MongoDB
    const result = await db
      .collection<User>("users")
      .insertOne(user);

    // 7️⃣ Create JWT token
    const token = signToken({
      userId: result.insertedId.toString(),
      email,
    });

    // 8️⃣ Set auth cookie (🔥 FIXED FOR LOCALHOST)
    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // false on localhost
      sameSite: "lax", // ✅ IMPORTANT FIX
      path: "/",
    });

    // 9️⃣ Response
    return Response.json({
      user: {
        id: result.insertedId.toString(),
        name,
        email,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return Response.json(
      { error: "Failed to register" },
      { status: 500 }
    );
  }
}
