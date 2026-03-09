"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import SearchBar from "@/components/SearchBar";

type Tab = "packages" | "supplements" | "diet";

interface Package {
  _id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  description?: string;
}

interface Supplement {
  _id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  description?: string;
}

interface DietPlan {
  _id: string;
  title: string;
  category: string;
  calories: number;
  meals: string[];
  description?: string;
}

export default function UserSearch() {
  const { status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("packages");
  const [searchQuery, setSearchQuery] = useState("");
  const [packages, setPackages] = useState<Package[]>([]);
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true);

        const [packagesRes, supplementsRes, dietRes] = await Promise.all([
          fetch("/api/packages"),
          fetch("/api/supplements"),
          fetch("/api/diet"),
        ]);

        if (packagesRes.ok) {
          const data = await packagesRes.json();
          setPackages(Array.isArray(data) ? data : []);
        }
        if (supplementsRes.ok) {
          const data = await supplementsRes.json();
          setSupplements(Array.isArray(data) ? data : []);
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
      fetchAll();
    }
  }, [status]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query.toLowerCase());
  }, []);

  // Filtered data
  const filteredPackages = packages.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery) ||
      p.duration.toLowerCase().includes(searchQuery) ||
      p.features?.some((f) => f.toLowerCase().includes(searchQuery))
  );

  const filteredSupplements = supplements.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery) ||
      s.category.toLowerCase().includes(searchQuery)
  );

  const filteredDietPlans = dietPlans.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery) ||
      d.category.toLowerCase().includes(searchQuery)
  );

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "packages", label: "Packages", count: filteredPackages.length },
    { key: "supplements", label: "Supplements", count: filteredSupplements.length },
    { key: "diet", label: "Diet Plans", count: filteredDietPlans.length },
  ];

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
          <h1 className="text-3xl font-bold text-white">Search Records</h1>
          <p className="mt-1 text-gray-400">
            Browse packages, supplements, and diet plans
          </p>
        </div>

        {/* Search Bar */}
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search packages, supplements, diet plans..."
        />

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-gray-800 pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-orange-500 text-orange-400"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
              <span className="ml-2 text-xs opacity-70">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {/* Packages Tab */}
          {activeTab === "packages" && (
            <>
              {filteredPackages.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-5xl mb-4">📦</p>
                  <p className="text-gray-400 text-lg">No packages found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredPackages.map((pkg) => (
                    <div
                      key={pkg._id}
                      className="rounded-xl border border-gray-800 bg-gray-900/60 p-6 hover:border-orange-500/40 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-white">
                          {pkg.name}
                        </h3>
                        <span className="text-orange-400 font-bold text-xl">
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
                              <span className="text-orange-500 text-xs">
                                ●
                              </span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Supplements Tab */}
          {activeTab === "supplements" && (
            <>
              {filteredSupplements.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-5xl mb-4">💊</p>
                  <p className="text-gray-400 text-lg">
                    No supplements found
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredSupplements.map((supp) => (
                    <div
                      key={supp._id}
                      className="rounded-xl border border-gray-800 bg-gray-900/60 p-6 hover:border-orange-500/40 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-white">
                          {supp.name}
                        </h3>
                        <span className="text-orange-400 font-bold text-lg">
                          ${supp.price}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-400">
                          {supp.category}
                        </span>
                        <span
                          className={`text-sm ${
                            supp.stock > 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {supp.stock > 0
                            ? `${supp.stock} in stock`
                            : "Out of stock"}
                        </span>
                      </div>
                      {supp.description && (
                        <p className="text-sm text-gray-500 leading-relaxed">
                          {supp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Diet Plans Tab */}
          {activeTab === "diet" && (
            <>
              {filteredDietPlans.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-5xl mb-4">🥗</p>
                  <p className="text-gray-400 text-lg">
                    No diet plans found
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredDietPlans.map((plan) => (
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
                        <span className="text-sm text-amber-400 font-medium">
                          {plan.calories} cal
                        </span>
                      </div>
                      {plan.description && (
                        <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                          {plan.description}
                        </p>
                      )}
                      {plan.meals && plan.meals.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                            Meals
                          </p>
                          <ul className="space-y-1.5">
                            {plan.meals.map((meal, idx) => (
                              <li
                                key={idx}
                                className="flex items-center gap-2 text-sm text-gray-300"
                              >
                                <span className="text-orange-500 text-xs">
                                  ●
                                </span>
                                {meal}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
