"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardCard from "@/components/DashboardCard";
import Link from "next/link";

interface Member {
  _id: string;
  name: string;
  email: string;
  phone: string;
  package: string;
  joinDate: string;
  status: string;
}

interface Bill {
  _id: string;
  status: string;
}

export default function MemberDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchData() {
      if (!session?.user?.email) return;

      try {
        setLoading(true);

        const membersRes = await fetch(
          `/api/members?search=${encodeURIComponent(session.user.email)}`
        );
        if (!membersRes.ok) throw new Error("Failed to fetch member data");
        const membersData = await membersRes.json();
        const currentMember = Array.isArray(membersData)
          ? membersData[0]
          : membersData;

        if (currentMember) {
          setMember(currentMember);

          const billsRes = await fetch(
            `/api/bills?memberId=${currentMember._id}`
          );
          if (billsRes.ok) {
            const billsData = await billsRes.json();
            setBills(Array.isArray(billsData) ? billsData : []);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    if (status === "authenticated") {
      fetchData();
    }
  }, [session, status]);

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

  const pendingBills = bills.filter((b) => b.status === "pending").length;
  const daysSinceJoined = member?.joinDate
    ? Math.floor(
        (Date.now() - new Date(member.joinDate).getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Member Dashboard</h1>
          <p className="mt-1 text-gray-400">
            Welcome back, {member?.name || session?.user?.name || "Member"}
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="Membership Status"
            value={member?.status || "N/A"}
            icon="✅"
            color="green"
          />
          <DashboardCard
            title="Pending Bills"
            value={pendingBills}
            icon="📄"
            color="yellow"
          />
          <DashboardCard
            title="Package"
            value={member?.package || "N/A"}
            icon="📦"
            color="orange"
          />
          <DashboardCard
            title="Days Since Joined"
            value={daysSinceJoined}
            icon="📅"
            color="blue"
          />
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">
            Quick Links
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/member/bills"
              className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900/60 p-5 hover:border-orange-500/40 transition-colors group"
            >
              <span className="text-3xl">🧾</span>
              <div>
                <p className="font-semibold text-white group-hover:text-orange-400 transition-colors">
                  View Bills
                </p>
                <p className="text-sm text-gray-400">
                  Check receipts &amp; payment history
                </p>
              </div>
            </Link>
            <Link
              href="/member/notifications"
              className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900/60 p-5 hover:border-orange-500/40 transition-colors group"
            >
              <span className="text-3xl">🔔</span>
              <div>
                <p className="font-semibold text-white group-hover:text-orange-400 transition-colors">
                  Notifications
                </p>
                <p className="text-sm text-gray-400">
                  Announcements &amp; reminders
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
