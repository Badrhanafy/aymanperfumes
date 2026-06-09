// src/components/DashboardOverview.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  Package,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Layers,
  Tag,
  Clock,
  ChevronRight,
} from "lucide-react";

export default function DashboardOverview({ perfumes = [] }) {
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [revenue, setRevenue] = useState(0);
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/orders", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Orders fetch error:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [revRes, dailyRes] = await Promise.all([
        fetch("http://localhost:8000/api/admin/stats/revenue", {
          credentials: "include",
        }),
        fetch("http://localhost:8000/api/admin/stats/daily-revenue?days=30", {
          credentials: "include",
        }),
      ]);
      const revData = await revRes.json();
      const dailyData = await dailyRes.json();
      setRevenue(revData.revenue);
      setDailyRevenue(dailyData);
    } catch (err) {
      console.error("Stats fetch error:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  // ========================
  // CORE KPIs
  // ========================
  const totalCount = perfumes.length;

  const totalBrands = useMemo(() => {
    const set = new Set(perfumes.map((p) => p.brand?.name || "Unknown"));
    return set.size;
  }, [perfumes]);

  const lowStockCount = useMemo(() => {
    return perfumes.filter((p) => Number(p.stock || 0) <= 10).length;
  }, [perfumes]);

  const outOfStockCount = useMemo(() => {
    return perfumes.filter((p) => Number(p.stock || 0) === 0).length;
  }, [perfumes]);

  // ========================
  // ORDER KPIs
  // ========================
  const orderMetrics = useMemo(() => {
    if (!orders.length) return { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 };
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_price), 0);
    const avgOrderValue = totalRevenue / totalOrders;
    return { totalOrders, totalRevenue, avgOrderValue };
  }, [orders]);

  const completedOrders = useMemo(() => {
    return orders.filter((o) => o.status === "completed").length;
  }, [orders]);

  const pendingOrders = useMemo(() => {
    return orders.filter((o) => o.status === "pending").length;
  }, [orders]);

  // Status distribution
  const statusDistribution = useMemo(() => {
    const statusCounts = {};
    orders.forEach((order) => {
      const status = order.status;
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const statusColors = {
    pending: "#f59e0b",
    processing: "#3b82f6",
    completed: "#10b981",
    cancelled: "#ef4444",
  };

  const statusLabels = {
    pending: "Pending",
    processing: "Processing",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  // Recent orders (last 5)
  const recentOrders = [...orders].slice(-5).reverse();

  // ========================
  // REVENUE TREND DATA
  // ========================
  const revenueTrendData = useMemo(() => {
    if (!dailyRevenue.length) return [];
    return dailyRevenue.map((d) => ({
      date: d.date,
      revenue: d.revenue,
      orders: orders.filter((o) => {
        const orderDate = new Date(o.created_at).toISOString().split("T")[0];
        return orderDate === d.date;
      }).length,
    }));
  }, [dailyRevenue, orders]);

  // ========================
  // BRAND DATA (Horizontal Bar)
  // ========================
  const brandData = useMemo(() => {
    const raw = Object.values(
      perfumes.reduce((acc, p) => {
        const name = p.brand?.name || "Unknown";
        if (!acc[name]) acc[name] = { name, value: 0 };
        acc[name].value++;
        return acc;
      }, {})
    )
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    const colors = ["#10b981", "#34d399", "#6ee7b7", "#059669", "#047857", "#065f46"];
    return raw.map((b, i) => ({ ...b, fill: colors[i % colors.length] }));
  }, [perfumes]);

  // ========================
  // STOCK STATUS DATA
  // ========================
  const stockStatusData = [
    {
      name: "In Stock",
      value: perfumes.filter((p) => Number(p.stock) > 10).length,
      color: "#10b981",
    },
    {
      name: "Low Stock",
      value: perfumes.filter((p) => Number(p.stock) > 0 && Number(p.stock) <= 10).length,
      color: "#f59e0b",
    },
    {
      name: "Out of Stock",
      value: perfumes.filter((p) => Number(p.stock) === 0).length,
      color: "#ef4444",
    },
  ];

  // ========================
  // CUSTOM TOOLTIPS
  // ========================
  const RevenueTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-xl px-4 py-3 shadow-2xl backdrop-blur-xl">
          <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">
            {new Date(label).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
          </p>
          <p className="text-emerald-400 font-semibold text-lg">
            ${payload[0].value.toFixed(2)}
          </p>
          {payload[1] && (
            <p className="text-white/30 text-xs mt-1">{payload[1].value} orders</p>
          )}
        </div>
      );
    }
    return null;
  };

  const BrandTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-xl px-4 py-3 shadow-2xl">
          <p className="text-white font-medium text-sm">{payload[0].payload.name}</p>
          <p className="text-emerald-400 text-xs mt-1">{payload[0].value} products</p>
        </div>
      );
    }
    return null;
  };

  const OrderStatusTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-xl px-4 py-3 shadow-2xl">
          <p className="text-white font-medium text-sm capitalize">{statusLabels[data.name] || data.name}</p>
          <p className="text-emerald-400 text-xs mt-1">{data.value} orders</p>
        </div>
      );
    }
    return null;
  };

  // ========================
  // KPI CARD COMPONENT
  // ========================
  const KpiCard = ({ label, value, subValue, icon: Icon, trend, trendValue, accent = "emerald" }) => {
    const accentColors = {
      emerald: {
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        text: "text-emerald-400",
        glow: "bg-emerald-500/10",
      },
      white: {
        bg: "bg-white/[0.03]",
        border: "border-white/[0.06]",
        text: "text-white/50",
        glow: "bg-white/5",
      },
      amber: {
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        text: "text-amber-400",
        glow: "bg-amber-500/10",
      },
      blue: {
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        text: "text-blue-400",
        glow: "bg-blue-500/10",
      },
    };

    const colors = accentColors[accent];

    return (
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6 backdrop-blur-md hover:bg-white/[0.025] transition-all duration-300 group">
        <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full blur-3xl opacity-0 group-hover:opacity-100 ${colors.glow} transition-opacity duration-500`} />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-5">
            <div className={`w-11 h-11 rounded-xl ${colors.bg} ${colors.text} ${colors.border} border flex items-center justify-center`}>
              <Icon size={20} strokeWidth={1.5} />
            </div>
            {trend && (
              <div className={`flex items-center gap-1 text-[11px] font-medium ${
                trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-white/30"
              }`}>
                {trend === "up" ? <ArrowUpRight size={12} /> : trend === "down" ? <ArrowDownRight size={12} /> : <Minus size={12} />}
                {trendValue}
              </div>
            )}
          </div>
          <p className="text-white/25 text-[10px] uppercase tracking-[0.2em] font-medium mb-2">{label}</p>
          <h2 className="text-3xl font-light text-white tracking-tight">{value}</h2>
          {subValue && <p className="text-white/20 text-xs mt-1.5">{subValue}</p>}
        </div>
      </div>
    );
  };

  // ========================
  // SECTION HEADER
  // ========================
  const SectionHeader = ({ title, subtitle, badge }) => (
    <div className="flex items-end justify-between mb-6">
      <div>
        <h3 className="text-base font-light text-white tracking-wide">{title}</h3>
        <p className="text-white/20 text-[10px] mt-1 uppercase tracking-[0.2em]">{subtitle}</p>
      </div>
      {badge && (
        <div className="flex items-center gap-2 text-emerald-400/50 text-[10px] uppercase tracking-[0.15em]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {badge}
        </div>
      )}
    </div>
  );

  // ========================
  // RECENT ORDERS TABLE
  // ========================
  const RecentOrdersTable = () => {
    if (ordersLoading) {
      return (
        <div className="py-12 text-center">
          <div className="w-5 h-5 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-white/20 text-xs tracking-wide">Loading orders...</p>
        </div>
      );
    }
    if (recentOrders.length === 0) {
      return (
        <div className="py-12 text-center">
          <ShoppingBag size={24} className="text-white/10 mx-auto mb-3" />
          <p className="text-white/15 text-sm">No orders yet</p>
        </div>
      );
    }
    return (
      <div className="space-y-2">
        {recentOrders.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.015] border border-white/[0.04] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-200 group cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                order.status === "completed"
                  ? "bg-emerald-500/8 text-emerald-400/60 border border-emerald-500/15"
                  : order.status === "cancelled"
                  ? "bg-red-500/8 text-red-400/60 border border-red-500/15"
                  : "bg-amber-500/8 text-amber-400/60 border border-amber-500/15"
              }`}>
                <Package size={16} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-white/70 text-sm font-medium">#{order.id}</p>
                <p className="text-white/15 text-[11px] mt-0.5">
                  {order.guest_name || order.user?.name || "Guest"} · {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="text-right flex items-center gap-3">
              <div>
                <p className="text-white font-medium text-sm">${Number(order.total_price).toFixed(2)}</p>
                <span className={`text-[10px] uppercase tracking-wider font-medium ${
                  order.status === "completed"
                    ? "text-emerald-400/70"
                    : order.status === "cancelled"
                    ? "text-red-400/70"
                    : "text-amber-400/70"
                }`}>
                  {order.status}
                </span>
              </div>
              <ChevronRight size={14} className="text-white/10 group-hover:text-white/30 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] p-6 md:p-10 font-sans relative">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/[0.02] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-white/[0.015] rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400/50 text-[10px] uppercase tracking-[0.25em] font-medium">Admin Panel</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-light text-white tracking-tight">
              Analytics <span className="font-semibold text-emerald-400">Dashboard</span>
            </h1>
            <p className="text-white/20 text-sm mt-2 font-light tracking-wide">
              Real-time insights into your perfume inventory and orders
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/[0.06] border border-emerald-500/15 text-emerald-400/70 text-[10px] uppercase tracking-[0.2em] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Data
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] text-white/30 text-[10px] uppercase tracking-[0.2em]">
              <Clock size={12} strokeWidth={1.5} />
              {new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </div>
          </div>
        </div>

        {/* ORDER KPIs ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Total Orders"
            value={orderMetrics.totalOrders.toLocaleString()}
            subValue={`${completedOrders} completed`}
            icon={ShoppingBag}
            accent="emerald"
          />
          <KpiCard
            label="Total Revenue"
            value={statsLoading ? "—" : `$${Number(revenue).toLocaleString()}`}
            subValue={statsLoading ? "" : `${orderMetrics.totalOrders} transactions`}
            icon={DollarSign}
            accent="emerald"
          />
          <KpiCard
            label="Avg Order Value"
            value={`$${orderMetrics.avgOrderValue.toFixed(2)}`}
            icon={TrendingUp}
            accent="white"
          />
          <KpiCard
            label="Pending Orders"
            value={pendingOrders}
            subValue={pendingOrders > 0 ? "Requires attention" : "All caught up"}
            icon={Layers}
            accent={pendingOrders > 0 ? "amber" : "white"}
          />
        </div>

        {/* INVENTORY KPIs ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard
            label="Total Products"
            value={totalCount.toLocaleString()}
            subValue={`${totalBrands} brands`}
            icon={Package}
            accent="emerald"
          />
          <KpiCard
            label="Total Brands"
            value={totalBrands}
            icon={Tag}
            accent="white"
          />
          <KpiCard
            label="Low Stock Items"
            value={lowStockCount}
            subValue={outOfStockCount > 0 ? `${outOfStockCount} out of stock` : "All in stock"}
            icon={AlertTriangle}
            accent={lowStockCount > 0 ? "amber" : "white"}
          />
        </div>

        {/* LOW STOCK ALERT */}
        {lowStockCount > 0 && (
          <div className="flex items-center gap-4 px-6 py-4 rounded-2xl border border-amber-500/15 bg-amber-500/[0.02] backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-amber-500/8 border border-amber-500/15 flex items-center justify-center text-amber-400/70 flex-shrink-0">
              <AlertTriangle size={18} strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <p className="text-amber-400/70 text-sm font-medium">Low Stock Alert</p>
              <p className="text-white/20 text-xs mt-0.5">
                {lowStockCount} perfume{lowStockCount > 1 ? "s are" : " is"} running low on inventory
              </p>
            </div>
            <div className="ml-auto">
              <span className="px-3 py-1.5 bg-amber-500/8 text-amber-400/70 text-[10px] font-semibold rounded-full border border-amber-500/15 uppercase tracking-wider">
                {lowStockCount} items
              </span>
            </div>
          </div>
        )}

        {/* REVENUE TREND CHART */}
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.015] backdrop-blur-md p-6 md:p-8">
          <SectionHeader
            title="Revenue Trend"
            subtitle="Daily sales performance — Last 30 days"
            badge="Live"
          />
          {statsLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={340}>
              <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10 }}
                  tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10 }}
                  tickFormatter={(val) => `$${val}`}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<RevenueTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                  animationDuration={1200}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* MIDDLE ROW: Top Brands + Order Status */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Top Brands — Horizontal Bar Chart */}
          <div className="lg:col-span-7 relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.015] backdrop-blur-md p-6 md:p-8">
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/[0.02] rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <SectionHeader
                title="Top Brands"
                subtitle="Products by brand"
              />
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={brandData} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={true} vertical={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip content={<BrandTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20} animationDuration={1200}>
                    {brandData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Order Status — Donut Chart */}
          <div className="lg:col-span-5 relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.015] backdrop-blur-md p-6 md:p-8">
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-white/[0.015] rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <SectionHeader
                title="Order Status"
                subtitle="Current distribution"
              />
              {ordersLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-6 h-6 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin"></div>
                </div>
              ) : statusDistribution.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag size={24} className="text-white/10 mx-auto mb-3" />
                  <p className="text-white/15 text-sm">No orders yet</p>
                </div>
              ) : (
                <div className="flex items-center">
                  <ResponsiveContainer width="60%" height={240}>
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                        animationDuration={1200}
                        stroke="none"
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={statusColors[entry.name] || "#6b7280"} />
                        ))}
                      </Pie>
                      <Tooltip content={<OrderStatusTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-4">
                    {statusDistribution.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColors[item.name] || "#6b7280" }} />
                        <div className="flex-1">
                          <p className="text-white/40 text-[11px] uppercase tracking-wider">{statusLabels[item.name] || item.name}</p>
                          <p className="text-white text-sm font-medium">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: Stock Status + Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Stock Status */}
          <div className="lg:col-span-5 relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.015] backdrop-blur-md p-6 md:p-8">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/[0.015] rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <SectionHeader
                title="Stock Status"
                subtitle="Inventory health overview"
              />
              <div className="space-y-6 mt-2">
                {stockStatusData.map((item, i) => (
                  <div key={i} className="group">
                    <div className="flex items-center gap-4 mb-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border"
                        style={{
                          backgroundColor: `${item.color}10`,
                          borderColor: `${item.color}20`,
                        }}
                      >
                        <span className="text-sm font-semibold" style={{ color: item.color }}>
                          {item.value}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white/40 text-[11px] uppercase tracking-[0.1em]">{item.name}</span>
                          <span className="text-white/20 text-[11px]">
                            {totalCount > 0 ? ((item.value / totalCount) * 100).toFixed(0) : 0}%
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{
                              width: `${totalCount > 0 ? (item.value / totalCount) * 100 : 0}%`,
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="lg:col-span-7 relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.015] backdrop-blur-md p-6 md:p-8">
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-emerald-500/[0.015] rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <h3 className="text-base font-light text-white tracking-wide">Recent Orders</h3>
                  <p className="text-white/20 text-[10px] mt-1 uppercase tracking-[0.2em]">Latest transactions</p>
                </div>
                <span className="px-3 py-1.5 bg-white/[0.03] text-white/25 text-[10px] uppercase tracking-[0.15em] rounded-full border border-white/[0.06]">
                  Last 5
                </span>
              </div>
              <RecentOrdersTable />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}