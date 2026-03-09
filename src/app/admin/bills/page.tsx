"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import BillCard from "@/components/BillCard";

interface Member {
  _id: string;
  name: string;
}

interface Bill {
  _id: string;
  memberId: { _id?: string; name?: string } | string;
  amount: number;
  date: string;
  dueDate: string;
  description: string;
  status: "paid" | "pending" | "overdue";
  paymentMethod: string;
}

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const [formData, setFormData] = useState({
    memberId: "",
    amount: "",
    description: "",
    dueDate: "",
    paymentMethod: "cash",
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [billsRes, membersRes] = await Promise.all([
        fetch("/api/bills"),
        fetch("/api/members"),
      ]);

      if (!billsRes.ok || !membersRes.ok) throw new Error("Failed to fetch data");

      const billsData = await billsRes.json();
      const membersData = await membersRes.json();

      setBills(Array.isArray(billsData) ? billsData : billsData.bills || []);
      setMembers(
        Array.isArray(membersData) ? membersData : membersData.members || []
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateBill(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.memberId || !formData.amount || !formData.description || !formData.dueDate) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: formData.memberId,
          amount: parseFloat(formData.amount),
          description: formData.description,
          dueDate: formData.dueDate,
          paymentMethod: formData.paymentMethod,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to create bill");
      }

      setFormData({ memberId: "", amount: "", description: "", dueDate: "", paymentMethod: "cash" });
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create bill");
    } finally {
      setSubmitting(false);
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

  function getMemberName(memberId: Bill["memberId"]): string {
    if (typeof memberId === "object" && memberId?.name) return memberId.name;
    if (typeof memberId === "string") {
      const found = members.find((m) => m._id === memberId);
      return found ? found.name : memberId;
    }
    return "Unknown";
  }

  function toBillCardData(bill: Bill) {
    return {
      memberId: typeof bill.memberId === "object" ? (bill.memberId?._id || "") : bill.memberId,
      amount: bill.amount,
      date: bill.date,
      dueDate: bill.dueDate,
      description: bill.description,
      status: bill.status,
      paymentMethod: bill.paymentMethod || "N/A",
    };
  }

  const inputClasses =
    "w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors";
  const labelClasses = "block text-sm font-medium text-gray-300 mb-1.5";

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Bills Management</h1>
            <p className="text-gray-400 mt-1">{bills.length} total bills</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === "table"
                    ? "bg-orange-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === "cards"
                    ? "bg-orange-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Cards
              </button>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              {showForm ? "Cancel" : "+ Create Bill"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
            {error}
            <button onClick={() => setError("")} className="float-right text-red-400 hover:text-red-300">
              ✕
            </button>
          </div>
        )}

        {/* Create Bill Form */}
        {showForm && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Create New Bill</h2>
            <form onSubmit={handleCreateBill} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Member</label>
                  <select
                    value={formData.memberId}
                    onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                    className={inputClasses}
                    required
                  >
                    <option value="">Select a member</option>
                    {members.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClasses}>Amount ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="Enter amount"
                    className={inputClasses}
                    required
                  />
                </div>
                <div>
                  <label className={labelClasses}>Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Bill description"
                    className={inputClasses}
                    required
                  />
                </div>
                <div>
                  <label className={labelClasses}>Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className={inputClasses}
                    required
                  />
                </div>
                <div>
                  <label className={labelClasses}>Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className={inputClasses}
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors font-medium flex items-center gap-2"
                >
                  {submitting && (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  Create Bill
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table View */}
        {viewMode === "table" ? (
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
                  </tr>
                </thead>
                <tbody>
                  {bills.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-500">
                        No bills found
                      </td>
                    </tr>
                  ) : (
                    bills.map((bill) => (
                      <tr
                        key={bill._id}
                        className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="py-3 px-4 text-white font-medium">
                          {getMemberName(bill.memberId)}
                        </td>
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
                            {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Cards View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bills.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">No bills found</div>
            ) : (
              bills.map((bill) => <BillCard key={bill._id} bill={toBillCardData(bill)} />)
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
