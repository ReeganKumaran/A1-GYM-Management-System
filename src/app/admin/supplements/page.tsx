"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface Supplement {
  _id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  stock: number;
}

const CATEGORIES = ["Protein", "Creatine", "Pre-Workout", "Vitamins", "Other"];

const emptyForm = {
  name: "",
  price: "",
  category: "Protein",
  description: "",
  stock: "",
};

export default function SupplementsPage() {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState(emptyForm);
  const [editFormData, setEditFormData] = useState(emptyForm);

  useEffect(() => {
    fetchSupplements();
  }, []);

  async function fetchSupplements() {
    try {
      setLoading(true);
      const res = await fetch("/api/supplements");
      if (!res.ok) throw new Error("Failed to fetch supplements");
      const data = await res.json();
      setSupplements(Array.isArray(data) ? data : data.supplements || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.description || !formData.stock) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/supplements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          price: parseFloat(formData.price),
          category: formData.category,
          description: formData.description,
          stock: parseInt(formData.stock),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to add supplement");
      }

      setFormData(emptyForm);
      setShowForm(false);
      fetchSupplements();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add supplement");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(s: Supplement) {
    setEditId(s._id);
    setEditFormData({
      name: s.name,
      price: s.price.toString(),
      category: s.category,
      description: s.description,
      stock: s.stock.toString(),
    });
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editId) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/supplements?id=${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editFormData.name,
          price: parseFloat(editFormData.price),
          category: editFormData.category,
          description: editFormData.description,
          stock: parseInt(editFormData.stock),
        }),
      });

      if (!res.ok) throw new Error("Failed to update supplement");

      setEditId(null);
      fetchSupplements();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update supplement");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/supplements?id=${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete supplement");
      setDeleteId(null);
      fetchSupplements();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
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
            <h1 className="text-2xl font-bold text-white">Supplement Store</h1>
            <p className="text-gray-400 mt-1">Manage gym supplements and inventory</p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setEditId(null); }}
            className="px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            {showForm ? "Cancel" : "+ Add Supplement"}
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

        {/* Add Supplement Form */}
        {showForm && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Add New Supplement</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Supplement name"
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
                    placeholder="Price"
                    className={inputClasses}
                    required
                  />
                </div>
                <div>
                  <label className={labelClasses}>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={inputClasses}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClasses}>Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="Stock quantity"
                    className={inputClasses}
                    required
                  />
                </div>
              </div>
              <div>
                <label className={labelClasses}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Supplement description"
                  rows={3}
                  className={inputClasses}
                  required
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
                  Add Supplement
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Supplements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {supplements.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No supplements found. Add your first supplement above.
            </div>
          ) : (
            supplements.map((supplement) => (
              <div
                key={supplement._id}
                className="bg-gray-900 rounded-xl border border-gray-800 p-5 hover:border-orange-500/30 transition-colors"
              >
                {editId === supplement._id ? (
                  /* Inline Edit Form */
                  <form onSubmit={handleEdit} className="space-y-3">
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className={inputClasses}
                      required
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editFormData.price}
                        onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                        className={inputClasses}
                        placeholder="Price"
                        required
                      />
                      <input
                        type="number"
                        min="0"
                        value={editFormData.stock}
                        onChange={(e) => setEditFormData({ ...editFormData, stock: e.target.value })}
                        className={inputClasses}
                        placeholder="Stock"
                        required
                      />
                    </div>
                    <select
                      value={editFormData.category}
                      onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                      className={inputClasses}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <textarea
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                      className={inputClasses}
                      rows={2}
                      required
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 px-3 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditId(null)}
                        className="flex-1 px-3 py-1.5 bg-gray-800 text-gray-300 text-sm rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Card Display */
                  <>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-base font-semibold text-white">{supplement.name}</h3>
                        <span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
                          {supplement.category}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-orange-400">
                        {formatCurrency(supplement.price)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{supplement.description}</p>
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm font-medium ${
                          supplement.stock > 10
                            ? "text-green-400"
                            : supplement.stock > 0
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}
                      >
                        Stock: {supplement.stock}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(supplement)}
                          className="px-3 py-1 text-xs bg-blue-500/15 text-blue-400 rounded-lg hover:bg-blue-500/25 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(supplement._id)}
                          className="px-3 py-1 text-xs bg-red-500/15 text-red-400 rounded-lg hover:bg-red-500/25 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-white mb-2">Confirm Delete</h2>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this supplement? This action cannot be undone.
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
