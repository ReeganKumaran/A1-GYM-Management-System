"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardCard from "@/components/DashboardCard";
import Link from "next/link";

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [packagesCount, setPackagesCount] = useState(0);
  const [supplementsCount, setSupplementsCount] = useState(0);
  const [dietCount, setDietCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchCounts() {
      try {
        setLoading(true);

        const [packagesRes, supplementsRes, dietRes] = await Promise.all([
          fetch("/api/packages"),
          fetch("/api/supplements"),
          fetch("/api/diet"),
        ]);

        if (packagesRes.ok) {
          const data = await packagesRes.json();
          setPackagesCount(Array.isArray(data) ? data.length : 0);
        }
        if (supplementsRes.ok) {
          const data = await supplementsRes.json();
          setSupplementsCount(Array.isArray(data) ? data.length : 0);
        }
        if (dietRes.ok) {
          const data = await dietRes.json();
          setDietCount(Array.isArray(data) ? data.length : 0);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    if (status === "authenticated") {
      fetchCounts();
    }
  }, [status]);

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
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">User Dashboard</h1>
          <p className="mt-1 text-gray-400">
            Welcome, {session?.user?.name || "User"}
          </p>
        </div>

        {/* Profile Info */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Profile Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="text-white font-medium">
                {session?.user?.name || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-white font-medium">
                {session?.user?.email || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="text-white font-medium capitalize">
                {(session?.user as { role?: string })?.role || "User"}
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="Profile Status"
            value="Active"
            icon="👤"
            color="green"
          />
          <DashboardCard
            title="Available Packages"
            value={packagesCount}
            icon="📦"
            color="orange"
          />
          <DashboardCard
            title="Supplements"
            value={supplementsCount}
            icon="💊"
            color="purple"
          />
          <DashboardCard
            title="Diet Plans"
            value={dietCount}
            icon="🥗"
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
              href="/user/details"
              className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900/60 p-5 hover:border-orange-500/40 transition-colors group"
            >
              <span className="text-3xl">📋</span>
              <div>
                <p className="font-semibold text-white group-hover:text-orange-400 transition-colors">
                  View Details
                </p>
                <p className="text-sm text-gray-400">
                  Profile, packages &amp; diet plans
                </p>
              </div>
            </Link>
            <Link
              href="/user/search"
              className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900/60 p-5 hover:border-orange-500/40 transition-colors group"
            >
              <span className="text-3xl">🔍</span>
              <div>
                <p className="font-semibold text-white group-hover:text-orange-400 transition-colors">
                  Search Records
                </p>
                <p className="text-sm text-gray-400">
                  Packages, supplements &amp; diets
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
