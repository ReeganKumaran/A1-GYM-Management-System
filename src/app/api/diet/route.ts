import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Diet from "@/models/Diet";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    let query = {};
    if (category) {
      query = { category };
    }

    const diets = await Diet.find(query).sort({ createdAt: -1 });

    return NextResponse.json(diets, { status: 200 });
  } catch (error) {
    console.error("Error fetching diets:", error);
    return NextResponse.json(
      { error: "Failed to fetch diets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    const diet = await Diet.create(body);

    return NextResponse.json(diet, { status: 201 });
  } catch (error) {
    console.error("Error creating diet:", error);
    return NextResponse.json(
      { error: "Failed to create diet" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Diet ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const diet = await Diet.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!diet) {
      return NextResponse.json(
        { error: "Diet not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(diet, { status: 200 });
  } catch (error) {
    console.error("Error updating diet:", error);
    return NextResponse.json(
      { error: "Failed to update diet" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Diet ID is required" },
        { status: 400 }
      );
    }

    const diet = await Diet.findByIdAndDelete(id);

    if (!diet) {
      return NextResponse.json(
        { error: "Diet not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Diet deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting diet:", error);
    return NextResponse.json(
      { error: "Failed to delete diet" },
      { status: 500 }
    );
  }
}
