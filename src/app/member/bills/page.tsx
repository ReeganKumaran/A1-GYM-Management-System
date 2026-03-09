"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import BillCard from "@/components/BillCard";
import jsPDF from "jspdf";

interface Bill {
  _id: string;
  memberId: string;
  amount: number;
  date: string;
  dueDate: string;
  description: string;
  status: "paid" | "pending" | "overdue";
  paymentMethod: string;
}

type StatusFilter = "all" | "paid" | "pending" | "overdue";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function downloadReceipt(bill: Bill) {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 0, 210, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("A1 GYM", 105, 18, { align: "center" });
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Management System - Bill Receipt", 105, 30, { align: "center" });

  // Reset text color
  doc.setTextColor(30, 30, 30);

  // Receipt details
  doc.setFontSize(11);
  let y = 55;

  doc.setFont("helvetica", "bold");
  doc.text("Receipt Details", 20, y);
  y += 10;

  doc.setFont("helvetica", "normal");
  const details = [
    ["Description", bill.description],
    ["Amount", `$${bill.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`],
    ["Bill Date", formatDate(bill.date)],
    ["Due Date", formatDate(bill.dueDate)],
    ["Status", bill.status.charAt(0).toUpperCase() + bill.status.slice(1)],
    ["Payment Method", bill.paymentMethod],
    ["Member ID", bill.memberId],
  ];

  details.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, 80, y);
    y += 8;
  });

  // Footer
  y += 15;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, y, 190, y);
  y += 10;
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text("This is a computer-generated receipt from A1 GYM Management System.", 105, y, {
    align: "center",
  });
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, y + 6, {
    align: "center",
  });

  doc.save(`A1GYM_Receipt_${bill._id || Date.now()}.pdf`);
}

export default function MemberBills() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchBills() {
      if (!session?.user?.email) return;

      try {
        setLoading(true);

        // First find the member by session email
        const membersRes = await fetch(
          `/api/members?search=${encodeURIComponent(session.user.email)}`
        );
        if (!membersRes.ok) throw new Error("Failed to fetch member data");
        const membersData = await membersRes.json();
        const currentMember = Array.isArray(membersData)
          ? membersData[0]
          : membersData;

        if (!currentMember) {
          setError("Member profile not found");
          return;
        }

        // Fetch bills for this member
        const billsRes = await fetch(
          `/api/bills?memberId=${currentMember._id}`
        );
        if (!billsRes.ok) throw new Error("Failed to fetch bills");
        const billsData = await billsRes.json();
        setBills(Array.isArray(billsData) ? billsData : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    if (status === "authenticated") {
      fetchBills();
    }
  }, [session, status]);

  const filteredBills =
    filter === "all" ? bills : bills.filter((b) => b.status === filter);

  if (status === "loading" || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 max-w-md text-center">
            <p className="text-red-400 font-semibold text-lg mb-2">Error</p>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Bill Receipts</h1>
          <p className="mt-1 text-gray-400">
            View and download your payment receipts
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {(["all", "paid", "pending", "overdue"] as StatusFilter[]).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === tab
                    ? "bg-orange-500 text-white"
                    : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab !== "all" && (
                  <span className="ml-2 text-xs opacity-70">
                    ({bills.filter((b) => b.status === tab).length})
                  </span>
                )}
              </button>
            )
          )}
        </div>

        {/* Bills Grid */}
        {filteredBills.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🧾</p>
            <p className="text-gray-400 text-lg">No bills found</p>
            <p className="text-gray-500 text-sm mt-1">
              {filter !== "all"
                ? `No ${filter} bills to display`
                : "You have no bill records yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBills.map((bill, index) => (
              <div key={bill._id || index} className="space-y-3">
                <BillCard bill={bill} />
                <button
                  onClick={() => downloadReceipt(bill)}
                  className="w-full py-2.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500/20 transition-colors text-sm font-medium"
                >
                  Download Receipt
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
