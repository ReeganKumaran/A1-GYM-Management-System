import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Member from "@/models/Member";
import Bill from "@/models/Bill";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (!type) {
      return NextResponse.json(
        { error: "Report type is required. Use ?type=members or ?type=bills" },
        { status: 400 }
      );
    }

    if (type === "members") {
      const members = await Member.find()
        .populate("packageId")
        .sort({ createdAt: -1 });

      const report = members.map((member) => ({
        id: member._id,
        name: member.name,
        email: member.email,
        phone: member.phone,
        address: member.address,
        joinDate: member.joinDate,
        status: member.status,
        package: member.packageId ? (member.packageId as Record<string, string>).name : "N/A",
        emergencyContact: member.emergencyContact || "N/A",
      }));

      return NextResponse.json(report, { status: 200 });
    }

    if (type === "bills") {
      const bills = await Bill.find()
        .populate("memberId")
        .sort({ createdAt: -1 });

      const report = bills.map((bill) => ({
        id: bill._id,
        memberName: bill.memberId ? (bill.memberId as Record<string, string>).name : "N/A",
        memberEmail: bill.memberId ? (bill.memberId as Record<string, string>).email : "N/A",
        amount: bill.amount,
        date: bill.date,
        dueDate: bill.dueDate,
        description: bill.description,
        status: bill.status,
        paymentMethod: bill.paymentMethod || "N/A",
      }));

      return NextResponse.json(report, { status: 200 });
    }

    return NextResponse.json(
      { error: "Invalid report type. Use ?type=members or ?type=bills" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
