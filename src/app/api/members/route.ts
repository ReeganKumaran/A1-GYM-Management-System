import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Member from "@/models/Member";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ],
      };
    }

    const members = await Member.find(query)
      .populate("packageId")
      .sort({ createdAt: -1 });

    return NextResponse.json(members, { status: 200 });
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { name, email, phone, address, packageId, emergencyContact } = body;

    // Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    // Hash the default password
    const hashedPassword = await bcrypt.hash("member123", 10);

    // Create the User document with role "member"
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "member",
      phone,
    });

    // Create the Member document
    const member = await Member.create({
      userId: user._id,
      name,
      email,
      phone,
      address,
      packageId: packageId || undefined,
      emergencyContact: emergencyContact || undefined,
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("Error creating member:", error);
    return NextResponse.json(
      { error: "Failed to create member" },
      { status: 500 }
    );
  }
}
