"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import SearchBar from "@/components/SearchBar";
import MemberForm from "@/components/MemberForm";

interface Package {
  _id: string;
  name: string;
}

interface Member {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive" | "expired";
  packageId?: { _id: string; name: string } | string;
  joinDate: string;
  address: string;
  emergencyContact: string;
}

interface MemberFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  emergencyContact: string;
  packageId: string;
  status: string;
}

export default function MembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [membersRes, packagesRes] = await Promise.all([
        fetch("/api/members"),
        fetch("/api/packages"),
      ]);

      if (!membersRes.ok || !packagesRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const membersData = await membersRes.json();
      const packagesData = await packagesRes.json();

      const membersArr = Array.isArray(membersData)
        ? membersData
        : membersData.members || [];
      const packagesArr = Array.isArray(packagesData)
        ? packagesData
        : packagesData.packages || [];

      setMembers(membersArr);
      setFilteredMembers(membersArr);
      setPackages(packagesArr);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setFilteredMembers(members);
        return;
      }
      const q = query.toLowerCase();
      setFilteredMembers(
        members.filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.email.toLowerCase().includes(q) ||
            m.phone.includes(q)
        )
      );
    },
    [members]
  );

  async function handleAddMember(data: MemberFormData) {
    const res = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || "Failed to add member");
    }

    setShowAddModal(false);
    fetchData();
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/members/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete member");
      setDeleteId(null);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function getPackageName(pkgId: Member["packageId"]): string {
    if (typeof pkgId === "object" && pkgId?.name) return pkgId.name;
    if (typeof pkgId === "string") {
      const found = packages.find((p) => p._id === pkgId);
      return found ? found.name : pkgId;
    }
    return "N/A";
  }

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-green-500/15 text-green-400",
      inactive: "bg-gray-500/15 text-gray-400",
      expired: "bg-red-500/15 text-red-400",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          styles[status] || styles.inactive
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

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
            <h1 className="text-2xl font-bold text-white">Members Management</h1>
            <p className="text-gray-400 mt-1">
              Manage all gym members ({members.length} total)
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            + Add Member
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

        <div className="max-w-md">
          <SearchBar onSearch={handleSearch} placeholder="Search members by name, email, or phone..." />
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
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Joined</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-500">
                      No members found
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr
                      key={member._id}
                      className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="py-3 px-4 text-white font-medium">{member.name}</td>
                      <td className="py-3 px-4 text-gray-300">{member.email}</td>
                      <td className="py-3 px-4 text-gray-300">{member.phone}</td>
                      <td className="py-3 px-4">{statusBadge(member.status)}</td>
                      <td className="py-3 px-4 text-gray-300">{getPackageName(member.packageId)}</td>
                      <td className="py-3 px-4 text-gray-300">{formatDate(member.joinDate)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/admin/members/${member._id}`)}
                            className="px-3 py-1 text-xs bg-blue-500/15 text-blue-400 rounded-lg hover:bg-blue-500/25 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteId(member._id)}
                            className="px-3 py-1 text-xs bg-red-500/15 text-red-400 rounded-lg hover:bg-red-500/25 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add New Member</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white transition-colors text-xl"
              >
                ✕
              </button>
            </div>
            <MemberForm
              packages={packages}
              onSubmit={handleAddMember}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-white mb-2">Confirm Delete</h2>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this member? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {deleting && (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
