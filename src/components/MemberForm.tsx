"use client";

import { useState, FormEvent } from "react";

interface Package {
  _id: string;
  name: string;
}

interface MemberData {
  name: string;
  email: string;
  phone: string;
  address: string;
  emergencyContact: string;
  packageId: string;
  status: string;
}

interface MemberFormProps {
  initialData?: Partial<MemberData>;
  onSubmit: (data: MemberData) => Promise<void> | void;
  packages: Package[];
}

export default function MemberForm({
  initialData,
  onSubmit,
  packages,
}: MemberFormProps) {
  const [formData, setFormData] = useState<MemberData>({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
    emergencyContact: initialData?.emergencyContact || "",
    packageId: initialData?.packageId || "",
    status: initialData?.status || "active",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof MemberData, string>>>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const newErrors: Partial<Record<keyof MemberData, string>> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^\d{10,15}$/.test(formData.phone.replace(/[\s\-()]/g, ""))) {
      newErrors.phone = "Invalid phone number";
    }
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.emergencyContact.trim())
      newErrors.emergencyContact = "Emergency contact is required";
    if (!formData.packageId) newErrors.packageId = "Package is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof MemberData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  }

  const inputClasses =
    "w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors";
  const labelClasses = "block text-sm font-medium text-gray-300 mb-1.5";
  const errorClasses = "mt-1 text-xs text-red-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Name */}
        <div>
          <label htmlFor="name" className={labelClasses}>
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter full name"
            className={inputClasses}
          />
          {errors.name && <p className={errorClasses}>{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className={labelClasses}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email address"
            className={inputClasses}
          />
          {errors.email && <p className={errorClasses}>{errors.email}</p>}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className={labelClasses}>
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
            className={inputClasses}
          />
          {errors.phone && <p className={errorClasses}>{errors.phone}</p>}
        </div>

        {/* Emergency Contact */}
        <div>
          <label htmlFor="emergencyContact" className={labelClasses}>
            Emergency Contact
          </label>
          <input
            id="emergencyContact"
            name="emergencyContact"
            type="text"
            value={formData.emergencyContact}
            onChange={handleChange}
            placeholder="Enter emergency contact"
            className={inputClasses}
          />
          {errors.emergencyContact && (
            <p className={errorClasses}>{errors.emergencyContact}</p>
          )}
        </div>

        {/* Package */}
        <div>
          <label htmlFor="packageId" className={labelClasses}>
            Package
          </label>
          <select
            id="packageId"
            name="packageId"
            value={formData.packageId}
            onChange={handleChange}
            className={inputClasses}
          >
            <option value="">Select a package</option>
            {packages.map((pkg) => (
              <option key={pkg._id} value={pkg._id}>
                {pkg.name}
              </option>
            ))}
          </select>
          {errors.packageId && <p className={errorClasses}>{errors.packageId}</p>}
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className={labelClasses}>
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={inputClasses}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Address (full width) */}
      <div>
        <label htmlFor="address" className={labelClasses}>
          Address
        </label>
        <textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Enter full address"
          rows={3}
          className={inputClasses}
        />
        {errors.address && <p className={errorClasses}>{errors.address}</p>}
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {loading && (
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {initialData ? "Update Member" : "Add Member"}
        </button>
      </div>
    </form>
  );
}
