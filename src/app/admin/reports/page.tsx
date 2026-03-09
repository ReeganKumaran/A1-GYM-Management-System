"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface MemberReport {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  joinDate: string;
  packageId?: { name?: string } | string;
}

interface BillReport {
  _id: string;
  memberId: { name?: string } | string;
  amount: number;
  date: string;
  dueDate: string;
  status: string;
  description: string;
  paymentMethod: string;
}

export default function ReportsPage() {
  const [membersData, setMembersData] = useState<MemberReport[]>([]);
  const [billsData, setBillsData] = useState<BillReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"members" | "bills">("members");

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    try {
      setLoading(true);
      const [membersRes, billsRes] = await Promise.all([
        fetch("/api/reports?type=members"),
        fetch("/api/reports?type=bills"),
      ]);

      if (!membersRes.ok || !billsRes.ok) throw new Error("Failed to fetch reports");

      const members = await membersRes.json();
      const bills = await billsRes.json();

      setMembersData(Array.isArray(members) ? members : members.data || members.members || []);
      setBillsData(Array.isArray(bills) ? bills : bills.data || bills.bills || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function formatCurrency(amount: number): string {
    return "$" + amount.toLocaleString("en-US", { minimumFractionDigits: 2 });
  }

  function getMemberName(memberId: BillReport["memberId"]): string {
    if (typeof memberId === "object" && memberId?.name) return memberId.name;
    return typeof memberId === "string" ? memberId : "Unknown";
  }

  function getPackageName(pkgId: MemberReport["packageId"]): string {
    if (typeof pkgId === "object" && pkgId?.name) return pkgId.name;
    return typeof pkgId === "string" ? pkgId : "N/A";
  }

  function exportCSV(type: "members" | "bills") {
    let csvContent = "";

    if (type === "members") {
      csvContent = "Name,Email,Phone,Status,Package,Join Date\n";
      membersData.forEach((m) => {
        csvContent += `"${m.name}","${m.email}","${m.phone}","${m.status}","${getPackageName(m.packageId)}","${formatDate(m.joinDate)}"\n`;
      });
    } else {
      csvContent = "Member,Amount,Description,Date,Due Date,Status,Payment Method\n";
      billsData.forEach((b) => {
        csvContent += `"${getMemberName(b.memberId)}","${b.amount}","${b.description}","${formatDate(b.date)}","${formatDate(b.dueDate)}","${b.status}","${b.paymentMethod || "N/A"}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${type}-report.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function exportPDF(type: "members" | "bills") {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    const title = type === "members" ? "Members Report" : "Bills Report";
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);

    let y = 40;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 14;
    const lineHeight = 8;

    doc.setTextColor(0);
    doc.setFontSize(9);

    if (type === "members") {
      // Header
      doc.setFont("helvetica", "bold");
      doc.text("Name", margin, y);
      doc.text("Email", margin + 35, y);
      doc.text("Phone", margin + 85, y);
      doc.text("Status", margin + 120, y);
      doc.text("Join Date", margin + 150, y);
      y += lineHeight;
      doc.setDrawColor(200);
      doc.line(margin, y - 3, 200, y - 3);

      doc.setFont("helvetica", "normal");
      membersData.forEach((m) => {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
        doc.text(m.name.substring(0, 18), margin, y);
        doc.text(m.email.substring(0, 25), margin + 35, y);
        doc.text(m.phone, margin + 85, y);
        doc.text(m.status, margin + 120, y);
        doc.text(formatDate(m.joinDate), margin + 150, y);
        y += lineHeight;
      });
    } else {
      // Header
      doc.setFont("helvetica", "bold");
      doc.text("Member", margin, y);
      doc.text("Amount", margin + 35, y);
      doc.text("Description", margin + 60, y);
      doc.text("Date", margin + 110, y);
      doc.text("Status", margin + 145, y);
      y += lineHeight;
      doc.setDrawColor(200);
      doc.line(margin, y - 3, 200, y - 3);

      doc.setFont("helvetica", "normal");
      billsData.forEach((b) => {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
        doc.text(getMemberName(b.memberId).substring(0, 18), margin, y);
        doc.text(formatCurrency(b.amount), margin + 35, y);
        doc.text(b.description.substring(0, 25), margin + 60, y);
        doc.text(formatDate(b.date), margin + 110, y);
        doc.text(b.status, margin + 145, y);
        y += lineHeight;
      });
    }

    doc.save(`${type}-report.pdf`);
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-gray-400 mt-1">View and export gym reports</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
            {error}
            <button onClick={() => setError("")} className="float-right text-red-400 hover:text-red-300">
              ✕
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-gray-800 rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab("members")}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              activeTab === "members"
                ? "bg-orange-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Members Report
          </button>
          <button
            onClick={() => setActiveTab("bills")}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              activeTab === "bills"
                ? "bg-orange-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Bills Report
          </button>
        </div>

        {/* Members Report */}
        {activeTab === "members" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Members Report ({membersData.length} records)
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => exportCSV("members")}
                  className="px-4 py-2 bg-green-600/20 text-green-400 border border-green-600/30 rounded-lg hover:bg-green-600/30 transition-colors text-sm font-medium"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => exportPDF("members")}
                  className="px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-lg hover:bg-blue-600/30 transition-colors text-sm font-medium"
                >
                  Export PDF
                </button>
              </div>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 bg-gray-900/80">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Phone</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Package</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Join Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {membersData.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-gray-500">
                          No member data available
                        </td>
                      </tr>
                    ) : (
                      membersData.map((member) => (
                        <tr
                          key={member._id}
                          className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                        >
                          <td className="py-3 px-4 text-white">{member.name}</td>
                          <td className="py-3 px-4 text-gray-300">{member.email}</td>
                          <td className="py-3 px-4 text-gray-300">{member.phone}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                member.status === "active"
                                  ? "bg-green-500/15 text-green-400"
                                  : member.status === "expired"
                                  ? "bg-red-500/15 text-red-400"
                                  : "bg-gray-500/15 text-gray-400"
                              }`}
                            >
                              {member.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-300">{getPackageName(member.packageId)}</td>
                          <td className="py-3 px-4 text-gray-300">{formatDate(member.joinDate)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Bills Report */}
        {activeTab === "bills" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                Bills Report ({billsData.length} records)
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => exportCSV("bills")}
                  className="px-4 py-2 bg-green-600/20 text-green-400 border border-green-600/30 rounded-lg hover:bg-green-600/30 transition-colors text-sm font-medium"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => exportPDF("bills")}
                  className="px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-lg hover:bg-blue-600/30 transition-colors text-sm font-medium"
                >
                  Export PDF
                </button>
              </div>
            </div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 bg-gray-900/80">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Member</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Description</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Due Date</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billsData.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-gray-500">
                          No bill data available
                        </td>
                      </tr>
                    ) : (
                      billsData.map((bill) => (
                        <tr
                          key={bill._id}
                          className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                        >
                          <td className="py-3 px-4 text-white">{getMemberName(bill.memberId)}</td>
                          <td className="py-3 px-4 text-gray-300">{formatCurrency(bill.amount)}</td>
                          <td className="py-3 px-4 text-gray-300">{bill.description}</td>
                          <td className="py-3 px-4 text-gray-300">{formatDate(bill.date)}</td>
                          <td className="py-3 px-4 text-gray-300">{formatDate(bill.dueDate)}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                bill.status === "paid"
                                  ? "bg-green-500/15 text-green-400"
                                  : bill.status === "overdue"
                                  ? "bg-red-500/15 text-red-400"
                                  : "bg-yellow-500/15 text-yellow-400"
                              }`}
                            >
                              {bill.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-300">{bill.paymentMethod || "N/A"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
