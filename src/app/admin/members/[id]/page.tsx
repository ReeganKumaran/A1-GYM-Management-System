"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import MemberForm from "@/components/MemberForm";

interface Package {
  _id: string;
  name: string;
}

interface MemberData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  emergencyContact: string;
  packageId: string;
  status: string;
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

export default function EditMemberPage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params.id as string;

  const [member, setMember] = useState<MemberData | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [memberRes, packagesRes] = await Promise.all([
          fetch(`/api/members/${memberId}`),
          fetch("/api/packages"),
        ]);

        if (!memberRes.ok) throw new Error("Failed to fetch member");
        if (!packagesRes.ok) throw new Error("Failed to fetch packages");

        const memberData = await memberRes.json();
        const packagesData = await packagesRes.json();

        setMember(memberData);
        setPackages(packagesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [memberId]);

  async function fetchData() {
    try {
      setLoading(true);
      const [memberRes, packagesRes] = await Promise.all([
        fetch(`/api/members/${memberId}`),
        fetch("/api/packages"),
      ]);

      if (!memberRes.ok) throw new Error("Failed to fetch member");
      if (!packagesRes.ok) throw new Error("Failed to fetch packages");

      const memberData = await memberRes.json();
      const packagesData = await packagesRes.json();

      const memberObj = memberData.member || memberData;
      const packagesArr = Array.isArray(packagesData)
        ? packagesData
        : packagesData.packages || [];

      // Normalize packageId to string
      if (memberObj.packageId && typeof memberObj.packageId === "object") {
        memberObj.packageId = memberObj.packageId._id;
      }

      setMember(memberObj);
      setPackages(packagesArr);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(data: MemberFormData) {
    const res = await fetch(`/api/members/${memberId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || "Failed to update member");
    }

    router.push("/admin/members");
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

  if (error || !member) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-400 text-lg mb-4">{error || "Member not found"}</p>
            <button
              onClick={() => router.push("/admin/members")}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Back to Members
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/members")}
            className="text-gray-400 hover:text-white transition-colors"
          >
            &larr; Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Edit Member</h1>
            <p className="text-gray-400 mt-1">Update information for {member.name}</p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <MemberForm
            initialData={{
              name: member.name,
              email: member.email,
              phone: member.phone,
              address: member.address,
              emergencyContact: member.emergencyContact,
              packageId: member.packageId,
              status: member.status,
            }}
            packages={packages}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
