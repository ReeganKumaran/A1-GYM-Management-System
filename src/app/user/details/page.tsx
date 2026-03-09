"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";

interface Package {
  _id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  description?: string;
}

interface DietPlan {
  _id: string;
  title: string;
  category: string;
  calories: number;
  description?: string;
}

export default function UserDetails() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const [packagesRes, dietRes] = await Promise.all([
          fetch("/api/packages"),
          fetch("/api/diet"),
        ]);

        if (packagesRes.ok) {
          const data = await packagesRes.json();
          setPackages(Array.isArray(data) ? data : []);
        }
        if (dietRes.ok) {
          const data = await dietRes.json();
          setDietPlans(Array.isArray(data) ? data : []);
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
          <h1 className="text-3xl font-bold text-white">View Details</h1>
          <p className="mt-1 text-gray-400">
            Your profile, available packages, and diet plans
          </p>
        </div>

        {/* Profile Card */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-6">
          <h2 className="text-xl font-semibold text-white mb-5">
            Profile Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="text-lg text-white font-medium">
                {session?.user?.name || "N/A"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Email Address</p>
              <p className="text-lg text-white font-medium">
                {session?.user?.email || "N/A"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Account Role</p>
              <p className="text-lg text-white font-medium capitalize">
                {(session?.user as { role?: string })?.role || "User"}
              </p>
            </div>
          </div>
        </div>

        {/* Available Packages */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">
            Available Packages
          </h2>
          {packages.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-gray-800 bg-gray-900/60">
              <p className="text-gray-400">No packages available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div
                  key={pkg._id}
                  className="rounded-xl border border-gray-800 bg-gray-900/60 p-6 hover:border-orange-500/40 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">
                      {pkg.name}
                    </h3>
                    <span className="text-orange-400 font-bold text-lg">
                      ${pkg.price}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">
                    Duration: {pkg.duration}
                  </p>
                  {pkg.description && (
                    <p className="text-sm text-gray-500 mb-4">
                      {pkg.description}
                    </p>
                  )}
                  {pkg.features && pkg.features.length > 0 && (
                    <ul className="space-y-2">
                      {pkg.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 text-sm text-gray-300"
                        >
                          <span className="text-orange-500 text-xs">●</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Diet Plans Summary */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">
            Diet Plans Overview
          </h2>
          {dietPlans.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-gray-800 bg-gray-900/60">
              <p className="text-gray-400">No diet plans available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {dietPlans.map((plan) => (
                <div
                  key={plan._id}
                  className="rounded-xl border border-gray-800 bg-gray-900/60 p-6 hover:border-orange-500/40 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {plan.title}
                  </h3>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400">
                      {plan.category}
                    </span>
                    <span className="text-sm text-gray-400">
                      {plan.calories} cal
                    </span>
                  </div>
                  {plan.description && (
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {plan.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
