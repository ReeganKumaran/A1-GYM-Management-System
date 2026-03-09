"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardCard from "@/components/DashboardCard";

interface Member {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  joinDate: string;
}

interface Bill {
  _id: string;
  memberId: { name?: string } | string;
  amount: number;
  date: string;
  dueDate: string;
  status: string;
  description: string;
}

interface Stats {
  totalMembers: number;
  totalRevenue: number;
  activePackages: number;
  pendingBills: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalMembers: 0,
    totalRevenue: 0,
    activePackages: 0,
    pendingBills: 0,
  });
  const [recentMembers, setRecentMembers] = useState<Member[]>([]);
  const [recentBills, setRecentBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      const [membersRes, billsRes, packagesRes] = await Promise.all([
        fetch("/api/members"),
        fetch("/api/bills"),
        fetch("/api/packages"),
      ]);

      if (!membersRes.ok || !billsRes.ok || !packagesRes.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const members = await membersRes.json();
      const bills = await billsRes.json();
      const packages = await packagesRes.json();

      const membersArr = Array.isArray(members) ? members : members.members || [];
      const billsArr = Array.isArray(bills) ? bills : bills.bills || [];
      const packagesArr = Array.isArray(packages) ? packages : packages.packages || [];

      const totalRevenue = billsArr
        .filter((b: Bill) => b.status === "paid")
        .reduce((sum: number, b: Bill) => sum + b.amount, 0);

      const pendingBills = billsArr.filter(
        (b: Bill) => b.status === "pending" || b.status === "overdue"
      ).length;

      const activePackages = packagesArr.filter(
        (p: { isActive?: boolean }) => p.isActive !== false
      ).length;

      setStats({
        totalMembers: membersArr.length,
        totalRevenue,
        activePackages,
        pendingBills,
      });

      setRecentMembers(
        membersArr
          .sort(
            (a: Member, b: Member) =>
              new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()
          )
          .slice(0, 5)
      );

      setRecentBills(
        billsArr
          .sort(
            (a: Bill, b: Bill) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .slice(0, 5)
      );
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

  function getMemberName(memberId: Bill["memberId"]): string {
    if (typeof memberId === "object" && memberId?.name) return memberId.name;
    return typeof memberId === "string" ? memberId : "Unknown";
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

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">Overview of your gym management system</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard
            title="Total Members"
            value={stats.totalMembers}
            icon="👥"
            color="orange"
          />
          <DashboardCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon="💰"
            color="green"
          />
          <DashboardCard
            title="Active Packages"
            value={stats.activePackages}
            icon="📦"
            color="blue"
          />
          <DashboardCard
            title="Pending Bills"
            value={stats.pendingBills}
            icon="📋"
            color="yellow"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Members */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Recent Members</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-2 text-gray-400 font-medium">Name</th>
                    <th className="text-left py-3 px-2 text-gray-400 font-medium">Email</th>
                    <th className="text-left py-3 px-2 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-3 px-2 text-gray-400 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMembers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-500">
                        No members found
                      </td>
                    </tr>
                  ) : (
                    recentMembers.map((member) => (
                      <tr key={member._id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="py-3 px-2 text-white">{member.name}</td>
                        <td className="py-3 px-2 text-gray-300">{member.email}</td>
                        <td className="py-3 px-2">
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
                        <td className="py-3 px-2 text-gray-300">{formatDate(member.joinDate)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Bills */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Recent Bills</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-2 text-gray-400 font-medium">Member</th>
                    <th className="text-left py-3 px-2 text-gray-400 font-medium">Amount</th>
                    <th className="text-left py-3 px-2 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-3 px-2 text-gray-400 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBills.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-500">
                        No bills found
                      </td>
                    </tr>
                  ) : (
                    recentBills.map((bill) => (
                      <tr key={bill._id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="py-3 px-2 text-white">{getMemberName(bill.memberId)}</td>
                        <td className="py-3 px-2 text-gray-300">{formatCurrency(bill.amount)}</td>
                        <td className="py-3 px-2">
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
                        <td className="py-3 px-2 text-gray-300">{formatDate(bill.date)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
