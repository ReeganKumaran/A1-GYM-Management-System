"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface Package {
  _id: string;
  name: string;
  duration: number;
  durationUnit: "days" | "months" | "years";
  price: number;
  description: string;
  features: string[];
  isActive: boolean;
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    duration: "",
    durationUnit: "months",
    price: "",
    description: "",
    features: "",
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  async function fetchPackages() {
    try {
      setLoading(true);
      const res = await fetch("/api/packages");
      if (!res.ok) throw new Error("Failed to fetch packages");
      const data = await res.json();
      setPackages(Array.isArray(data) ? data : data.packages || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name || !formData.duration || !formData.price || !formData.description) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          duration: parseInt(formData.duration),
          durationUnit: formData.durationUnit,
          price: parseFloat(formData.price),
          description: formData.description,
          features: formData.features
            .split(",")
            .map((f) => f.trim())
            .filter(Boolean),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to create package");
      }

      setFormData({ name: "", duration: "", durationUnit: "months", price: "", description: "", features: "" });
      setShowForm(false);
      fetchPackages();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create package");
    } finally {
      setSubmitting(false);
    }
  }

  function formatCurrency(amount: number): string {
    return "$" + amount.toLocaleString("en-US", { minimumFractionDigits: 2 });
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
            <h1 className="text-2xl font-bold text-white">Fee Packages</h1>
            <p className="text-gray-400 mt-1">Manage gym membership packages</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            {showForm ? "Cancel" : "+ Add Package"}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
            {error}
            <button onClick={() => setError("")} className="float-right text-red-400 hover:text-red-300">
              ✕
            </button>
          </div>
        )}

        {/* Add Package Form */}
        {showForm && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Add New Package</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Package Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Premium Monthly"
                    className={inputClasses}
                    required
                  />
                </div>
                <div>
                  <label className={labelClasses}>Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Enter price"
                    className={inputClasses}
                    required
                  />
                </div>
                <div>
                  <label className={labelClasses}>Duration</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="Enter duration"
                    className={inputClasses}
                    required
                  />
                </div>
                <div>
                  <label className={labelClasses}>Duration Unit</label>
                  <select
                    value={formData.durationUnit}
                    onChange={(e) => setFormData({ ...formData, durationUnit: e.target.value })}
                    className={inputClasses}
                  >
                    <option value="days">Days</option>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClasses}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Package description"
                  rows={3}
                  className={inputClasses}
                  required
                />
              </div>
              <div>
                <label className={labelClasses}>Features (comma-separated)</label>
                <input
                  type="text"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="e.g., Gym Access, Personal Trainer, Pool Access"
                  className={inputClasses}
                />
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
                  Add Package
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No packages found. Add your first package above.
            </div>
          ) : (
            packages.map((pkg) => (
              <div
                key={pkg._id}
                className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-orange-500/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{pkg.name}</h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      pkg.isActive !== false
                        ? "bg-green-500/15 text-green-400"
                        : "bg-gray-500/15 text-gray-400"
                    }`}
                  >
                    {pkg.isActive !== false ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="mb-4">
                  <span className="text-3xl font-bold text-orange-400">
                    {formatCurrency(pkg.price)}
                  </span>
                  <span className="text-gray-400 ml-1">
                    / {pkg.duration} {pkg.durationUnit}
                  </span>
                </div>

                <p className="text-gray-400 text-sm mb-4">{pkg.description}</p>

                {pkg.features && pkg.features.length > 0 && (
                  <ul className="space-y-2">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                        <span className="text-orange-400 text-xs">&#10003;</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
