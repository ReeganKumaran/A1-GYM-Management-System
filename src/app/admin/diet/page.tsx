"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface Meal {
  name: string;
  time: string;
  items: string[];
  calories: number;
}

interface DietPlan {
  _id: string;
  title: string;
  category: "weight_loss" | "muscle_gain" | "maintenance" | "general";
  description: string;
  meals: Meal[];
  totalCalories: number;
}

const CATEGORIES = [
  { value: "weight_loss", label: "Weight Loss" },
  { value: "muscle_gain", label: "Muscle Gain" },
  { value: "maintenance", label: "Maintenance" },
  { value: "general", label: "General" },
];

const categoryStyles: Record<string, { bg: string; text: string }> = {
  weight_loss: { bg: "bg-red-500/15", text: "text-red-400" },
  muscle_gain: { bg: "bg-blue-500/15", text: "text-blue-400" },
  maintenance: { bg: "bg-green-500/15", text: "text-green-400" },
  general: { bg: "bg-purple-500/15", text: "text-purple-400" },
};


export default function DietPage() {
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "general",
    description: "",
  });
  const [meals, setMeals] = useState<{ name: string; time: string; items: string; calories: string }[]>([
    { name: "", time: "", items: "", calories: "" },
  ]);

  useEffect(() => {
    fetchDietPlans();
  }, []);

  async function fetchDietPlans() {
    try {
      setLoading(true);
      const res = await fetch("/api/diet");
      if (!res.ok) throw new Error("Failed to fetch diet plans");
      const data = await res.json();
      setDietPlans(Array.isArray(data) ? data : data.diets || data.dietPlans || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  function addMealEntry() {
    setMeals([...meals, { name: "", time: "", items: "", calories: "" }]);
  }

  function removeMealEntry(index: number) {
    if (meals.length <= 1) return;
    setMeals(meals.filter((_, i) => i !== index));
  }

  function updateMealEntry(index: number, field: string, value: string) {
    setMeals(
      meals.map((meal, i) => (i === index ? { ...meal, [field]: value } : meal))
    );
  }

  function calculateTotalCalories(): number {
    return meals.reduce((sum, meal) => sum + (parseInt(meal.calories) || 0), 0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title || !formData.description || meals.some((m) => !m.name || !m.time)) return;

    const totalCalories = calculateTotalCalories();

    const processedMeals: Meal[] = meals.map((m) => ({
      name: m.name,
      time: m.time,
      items: m.items
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      calories: parseInt(m.calories) || 0,
    }));

    try {
      setSubmitting(true);
      const res = await fetch("/api/diet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          description: formData.description,
          meals: processedMeals,
          totalCalories,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to create diet plan");
      }

      setFormData({ title: "", category: "general", description: "" });
      setMeals([{ name: "", time: "", items: "", calories: "" }]);
      setShowForm(false);
      fetchDietPlans();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create diet plan");
    } finally {
      setSubmitting(false);
    }
  }

  function getCategoryLabel(value: string): string {
    return CATEGORIES.find((c) => c.value === value)?.label || value;
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
            <h1 className="text-2xl font-bold text-white">Diet Plans</h1>
            <p className="text-gray-400 mt-1">Manage diet plans and meal schedules</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            {showForm ? "Cancel" : "+ Add Diet Plan"}
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

        {/* Add Diet Plan Form */}
        {showForm && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Add New Diet Plan</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Diet plan title"
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
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClasses}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Diet plan description"
                  rows={3}
                  className={inputClasses}
                  required
                />
              </div>

              {/* Meals */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-300">
                    Meals (Total: {calculateTotalCalories()} kcal)
                  </label>
                  <button
                    type="button"
                    onClick={addMealEntry}
                    className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    + Add Meal
                  </button>
                </div>
                <div className="space-y-3">
                  {meals.map((meal, index) => (
                    <div
                      key={index}
                      className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-400">
                          Meal {index + 1}
                        </span>
                        {meals.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMealEntry(index)}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <input
                          type="text"
                          value={meal.name}
                          onChange={(e) => updateMealEntry(index, "name", e.target.value)}
                          placeholder="Meal name"
                          className={inputClasses}
                          required
                        />
                        <input
                          type="text"
                          value={meal.time}
                          onChange={(e) => updateMealEntry(index, "time", e.target.value)}
                          placeholder="Time (e.g., 8:00 AM)"
                          className={inputClasses}
                          required
                        />
                        <input
                          type="text"
                          value={meal.items}
                          onChange={(e) => updateMealEntry(index, "items", e.target.value)}
                          placeholder="Items (comma-separated)"
                          className={inputClasses}
                        />
                        <input
                          type="number"
                          min="0"
                          value={meal.calories}
                          onChange={(e) => updateMealEntry(index, "calories", e.target.value)}
                          placeholder="Calories"
                          className={inputClasses}
                        />
                      </div>
                    </div>
                  ))}
                </div>
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
                  Add Diet Plan
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Diet Plans List */}
        <div className="space-y-4">
          {dietPlans.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gray-900 rounded-xl border border-gray-800">
              No diet plans found. Add your first diet plan above.
            </div>
          ) : (
            dietPlans.map((plan) => {
              const isExpanded = expandedId === plan._id;
              const style = categoryStyles[plan.category] || categoryStyles.general;

              return (
                <div
                  key={plan._id}
                  className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden hover:border-orange-500/20 transition-colors"
                >
                  {/* Header - clickable to expand */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : plan._id)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-white">{plan.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}
                          >
                            {getCategoryLabel(plan.category)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {plan.totalCalories} kcal
                          </span>
                          <span className="text-xs text-gray-500">
                            {plan.meals?.length || 0} meals
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-gray-400 text-lg transition-transform duration-200" style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }}>
                      &#9662;
                    </span>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-800 p-5 space-y-4">
                      <p className="text-sm text-gray-400">{plan.description}</p>

                      {plan.meals && plan.meals.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-3">Meals Breakdown</h4>
                          <div className="space-y-2">
                            {plan.meals.map((meal, i) => (
                              <div
                                key={i}
                                className="bg-gray-800/50 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-white">
                                      {meal.name}
                                    </span>
                                    <span className="text-xs text-gray-500">{meal.time}</span>
                                  </div>
                                  {meal.items && meal.items.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {meal.items.map((item, j) => (
                                        <span
                                          key={j}
                                          className="text-xs bg-gray-700/50 text-gray-300 px-2 py-0.5 rounded"
                                        >
                                          {item}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <span className="text-sm font-semibold text-orange-400 whitespace-nowrap">
                                  {meal.calories} kcal
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-2 border-t border-gray-800 flex justify-between items-center">
                        <span className="text-sm text-gray-400">Total Calories</span>
                        <span className="text-lg font-bold text-orange-400">
                          {plan.totalCalories} kcal
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
