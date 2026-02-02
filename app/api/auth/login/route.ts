export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { comparePassword, signToken } from "@/lib/auth";
import type { User } from "@/lib/models/user";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const users = db.collection<User>("users");

    const user = await users.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // ✅ FIX: use userId
    const token = signToken({
      userId: user._id!.toString(),
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.json({
      user: {
        id: user._id!.toString(),
        email: user.email,
        name: user.name,
      },
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
