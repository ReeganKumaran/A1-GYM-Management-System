import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    await dbConnect();

    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      return NextResponse.json(
        { message: "Admin user already exists", email: existingAdmin.email },
        { status: 200 }
      );
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = await User.create({
      name: "Admin",
      email: "admin@gym.com",
      password: hashedPassword,
      role: "admin",
    });

    return NextResponse.json(
      {
        message: "Admin user created successfully",
        user: { name: admin.name, email: admin.email, role: admin.role },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to seed admin user";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
