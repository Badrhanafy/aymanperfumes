import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function DashboardOverview({ perfumes = [] }) {
  // ========================
  // KPIs
  // ========================
  const totalCount = perfumes.length;

  const avgPrice = useMemo(() => {
    if (!totalCount) return 0;
    return (
      perfumes.reduce((acc, p) => acc + Number(p.price || 0), 0) /
      totalCount
    ).toFixed(2);
  }, [perfumes, totalCount]);

  const totalBrands = useMemo(() => {
    const set = new Set(perfumes.map((p) => p.brand?.name || "Unknown"));
    return set.size;
  }, [perfumes]);

  // ========================
  // PRICE DATA
  // ========================
  const priceData = [
    { name: "<100", value: perfumes.filter((p) => +p.price < 100).length },
    {
      name: "100-150",
      value: perfumes.filter((p) => +p.price >= 100 && +p.price < 150)
        .length,
    },
    {
      name: "150-200",
      value: perfumes.filter((p) => +p.price >= 150 && +p.price < 200)
        .length,
    },
    {
      name: "200-300",
      value: perfumes.filter((p) => +p.price >= 200 && +p.price < 300)
        .length,
    },
    { name: "300+", value: perfumes.filter((p) => +p.price >= 300).length },
  ];

  // ========================
  // BRAND DATA
  // ========================
  const brandData = Object.values(
    perfumes.reduce((acc, p) => {
      const name = p.brand?.name || "Unknown";
      if (!acc[name]) acc[name] = { name, value: 0 };
      acc[name].value++;
      return acc;
    }, {})
  );

  const COLORS = ["#111827", "#374151", "#6B7280", "#9CA3AF", "#D1D5DB"];

  // ========================
  // UI
  // ========================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6 font-sans">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl  font-bold text-gray-900">
          Analytics Dashboard
        </h1>
        <p className="text-gray-500 test text-sm mt-1">
          Perfume inventory insights & performance overview
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <div className="bg-white/70 backdrop-blur-xl border rounded-2xl p-6 shadow-sm hover:shadow-lg transition">
          <p className="text-gray-500 text-sm">Total Perfumes</p>
          <h2 className="text-3xl font-bold text-gray-900">{totalCount}</h2>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border rounded-2xl p-6 shadow-sm hover:shadow-lg transition">
          <p className="text-gray-500 text-sm">Average Price</p>
          <h2 className="text-3xl font-bold text-gray-900">${avgPrice}</h2>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border rounded-2xl p-6 shadow-sm hover:shadow-lg transition">
          <p className="text-gray-500 text-sm">Brands</p>
          <h2 className="text-3xl font-bold text-gray-900">{totalBrands}</h2>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* BAR CHART */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Price Distribution</h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priceData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {priceData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* PIE CHART */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Brand Distribution</h3>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={brandData}
                dataKey="value"
                nameKey="name"
                outerRadius={110}
                label
              >
                {brandData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}