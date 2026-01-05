import { useState } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Package, ShoppingCart, DollarSign, Eye, ShoppingBag, ArrowUpRight, ArrowDownRight, Calendar, LucideIcon } from "lucide-react";
import Layout from "../../components/layouts/Layout";

// Types
interface SalesData {
    month: string;
    sales: number;
    orders: number;
    revenue: number;
}

interface CategoryData {
    name: string;
    value: number;
    color: string;
    [key: string]: string | number;
}

interface Product {
    name: string;
    sales: number;
    stock: number;
    revenue: number;
    trend: "up" | "down";
    color: string;
}

interface Order {
    id: string;
    customer: string;
    product: string;
    amount: number;
    status: "completed" | "processing" | "pending";
    date: string;
}

interface StatCardProps {
    title: string;
    value: string;
    change: string;
    icon: LucideIcon;
    trend: "up" | "down";
    color: string;
}

// Sample data for Pashmina store
const salesData: SalesData[] = [
    { month: "Jan", sales: 245000, orders: 89, revenue: 267000 },
    { month: "Feb", sales: 312000, orders: 112, revenue: 341000 },
    { month: "Mar", sales: 289000, orders: 98, revenue: 315000 },
    { month: "Apr", sales: 356000, orders: 134, revenue: 389000 },
    { month: "May", sales: 401000, orders: 156, revenue: 437000 },
    { month: "Jun", sales: 378000, orders: 145, revenue: 412000 },
    { month: "Jul", sales: 423000, orders: 167, revenue: 461000 },
];

const categoryData: CategoryData[] = [
    { name: "Scarves", value: 42, color: "#8B5CF6" },
    { name: "Shawls", value: 28, color: "#3B82F6" },
    { name: "Wraps", value: 18, color: "#EC4899" },
    { name: "Stoles", value: 8, color: "#F59E0B" },
    { name: "Blankets", value: 4, color: "#10B981" },
];

const topProducts: Product[] = [
    { name: "Pashmina Scarf - Red XL", sales: 234, stock: 45, revenue: 351000, trend: "up", color: "Crimson Red" },
    { name: "Cashmere Shawl - Navy L", sales: 198, stock: 23, revenue: 297000, trend: "up", color: "Navy Blue" },
    { name: "Pashmina Wrap - Beige M", sales: 176, stock: 67, revenue: 220000, trend: "up", color: "Desert Beige" },
    { name: "Silk Blend Scarf - Emerald XL", sales: 145, stock: 89, revenue: 181250, trend: "down", color: "Emerald Green" },
    { name: "Cashmere Stole - Ivory L", sales: 123, stock: 34, revenue: 184500, trend: "up", color: "Ivory White" },
];

const recentOrders: Order[] = [
    { id: "#ORD-2401", customer: "Sophia Chen", product: "Pashmina Scarf - Red XL", amount: 1500, status: "completed", date: "2 hours ago" },
    { id: "#ORD-2402", customer: "Emma Johnson", product: "Cashmere Shawl - Navy L", amount: 1500, status: "processing", date: "4 hours ago" },
    { id: "#ORD-2403", customer: "Olivia Martinez", product: "Silk Blend Scarf - Emerald", amount: 1250, status: "completed", date: "5 hours ago" },
    { id: "#ORD-2404", customer: "Ava Williams", product: "Cashmere Stole - Ivory L", amount: 1500, status: "pending", date: "6 hours ago" },
    { id: "#ORD-2405", customer: "Isabella Brown", product: "Pashmina Wrap - Beige M", amount: 1250, status: "completed", date: "8 hours ago" },
];

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon, trend, color }) => (
    <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 bg-gradient-to-br from-${color}-100 to-${color}-50 rounded-xl shadow-sm`}>
                <Icon className={`h-6 w-6 text-${color}-600`} />
            </div>
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-semibold ${trend === "up" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}>
                {trend === "up" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                {change}
            </div>
        </div>
        <h3 className="text-sm text-gray-600 font-medium mb-2">{title}</h3>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
);

const Index: React.FC = () => {
    const [timeRange, setTimeRange] = useState<string>("7days");

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="max-w-[1600px] mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                Dashboard
                            </h1>
                            <p className="text-base text-gray-600 mt-2 flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Welcome back! Here's your Pashmina store overview.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                className="px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm hover:shadow-md transition-all"
                            >
                                <option value="7days">Last 7 Days</option>
                                <option value="30days">Last 30 Days</option>
                                <option value="90days">Last 90 Days</option>
                                <option value="year">This Year</option>
                            </select>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                        <StatCard
                            title="Total Revenue"
                            value="Rs. 4.23L"
                            change="+12.5%"
                            icon={DollarSign}
                            trend="up"
                            color="purple"
                        />
                        <StatCard
                            title="Total Orders"
                            value="1,876"
                            change="+8.2%"
                            icon={ShoppingCart}
                            trend="up"
                            color="blue"
                        />
                        <StatCard
                            title="Products in Stock"
                            value="2,458"
                            change="-3.1%"
                            icon={Package}
                            trend="down"
                            color="pink"
                        />
                        {/* <StatCard
                            title="Active Customers"
                            value="1,342"
                            change="+15.3%"
                            icon={Users}
                            trend="up"
                            color="green"
                        /> */}
                    </div>

                    {/* Row 1: Sales Overview + Category Distribution (2 columns) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Sales Overview */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Sales Overview</h2>
                                <div className="flex gap-4 text-sm">
                                    <span className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                        <span className="text-gray-600">Sales</span>
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        <span className="text-gray-600">Revenue</span>
                                    </span>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={280}>
                                <AreaChart data={salesData}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.05} />
                                        </linearGradient>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                                    <XAxis
                                        dataKey="month"
                                        stroke="#9CA3AF"
                                        style={{ fontSize: '12px', fontWeight: '500' }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#9CA3AF"
                                        style={{ fontSize: '12px', fontWeight: '500' }}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value / 1000}K`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '12px',
                                            fontSize: '13px',
                                            padding: '12px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                    <Area type="monotone" dataKey="sales" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                                    <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Category Distribution */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Sales by Category</h2>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) =>
                                            name && percent ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                                        }
                                        outerRadius={90}
                                        fill="#8884d8"
                                        dataKey="value"
                                        style={{ fontSize: '13px', fontWeight: '600' }}
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '12px',
                                            fontSize: '13px',
                                            padding: '12px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                {categoryData.map((cat, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm">
                                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: cat.color }}></div>
                                        <span className="text-gray-700 font-medium">{cat.name}</span>
                                        <span className="ml-auto font-bold text-gray-900">{cat.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Monthly Orders (half-width) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Monthly Orders</h2>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={salesData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                                    <XAxis
                                        dataKey="month"
                                        stroke="#9CA3AF"
                                        style={{ fontSize: '12px', fontWeight: '500' }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#9CA3AF"
                                        style={{ fontSize: '12px', fontWeight: '500' }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '12px',
                                            fontSize: '13px',
                                            padding: '12px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                    <Bar dataKey="orders" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Row 3: Top Products + Recent Orders (2 columns) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Products */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Top Products</h2>
                                <ShoppingBag className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="space-y-3">
                                {topProducts.map((product, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all group">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">{product.name}</h3>
                                                {product.trend === "up" ? (
                                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <TrendingDown className="h-4 w-4 text-red-600" />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-xs">
                                                <span className="text-gray-600">
                                                    <span className="font-medium text-gray-900">{product.sales}</span> sales
                                                </span>
                                                <span className="text-gray-600">
                                                    Stock: <span className="font-medium text-gray-900">{product.stock}</span>
                                                </span>
                                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">
                                                    {product.color}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className="text-base font-bold text-gray-900">Rs. {product.revenue.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Orders */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                                <Eye className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="space-y-3">
                                {recentOrders.map((order, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-sm font-semibold text-gray-900">{order.id}</h3>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${order.status === "completed"
                                                    ? "bg-green-100 text-green-700"
                                                    : order.status === "processing"
                                                        ? "bg-blue-100 text-blue-700"
                                                        : "bg-yellow-100 text-yellow-700"
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <p className="text-xs font-medium text-gray-700 mb-1">{order.customer}</p>
                                            <p className="text-xs text-gray-500">{order.product}</p>
                                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {order.date}
                                            </p>
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className="text-base font-bold text-gray-900">Rs. {order.amount.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Index;
