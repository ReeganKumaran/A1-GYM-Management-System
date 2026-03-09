import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Supplement from "@/models/Supplement";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    let query = {};
    if (category) {
      query = { category };
    }

    const supplements = await Supplement.find(query).sort({ createdAt: -1 });

    return NextResponse.json(supplements, { status: 200 });
  } catch (error) {
    console.error("Error fetching supplements:", error);
    return NextResponse.json(
      { error: "Failed to fetch supplements" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    const supplement = await Supplement.create(body);

    return NextResponse.json(supplement, { status: 201 });
  } catch (error) {
    console.error("Error creating supplement:", error);
    return NextResponse.json(
      { error: "Failed to create supplement" },
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
        { error: "Supplement ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const supplement = await Supplement.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!supplement) {
      return NextResponse.json(
        { error: "Supplement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(supplement, { status: 200 });
  } catch (error) {
    console.error("Error updating supplement:", error);
    return NextResponse.json(
      { error: "Failed to update supplement" },
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
        { error: "Supplement ID is required" },
        { status: 400 }
      );
    }

    const supplement = await Supplement.findByIdAndDelete(id);

    if (!supplement) {
      return NextResponse.json(
        { error: "Supplement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Supplement deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting supplement:", error);
    return NextResponse.json(
      { error: "Failed to delete supplement" },
      { status: 500 }
    );
  }
}
