import { Card } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { DollarSign, TrendingUp, Users, Target } from "lucide-react";

const revenueData = [
  { year: "Year 1", revenue: 5, users: 100 },
  { year: "Year 2", revenue: 12.5, users: 250 },
  { year: "Year 3", revenue: 30, users: 600 },
  { year: "Year 4", revenue: 60, users: 1200 },
  { year: "Year 5", revenue: 125, users: 2500 }
];

const revenueMixData = [
  { name: "Trading Spreads", value: 60 },
  { name: "Subscriptions", value: 30 },
  { name: "Staking", value: 10 }
];

const expenseData = [
  { name: "Marketing", value: 31.2 },
  { name: "Platform Costs", value: 19.1 },
  { name: "Compliance", value: 10.2 },
  { name: "Other OpEx", value: 39.5 }
];

const profitData = [
  { year: "Year 1", ebitda: 1.75, margin: 35 },
  { year: "Year 2", ebitda: 5.62, margin: 45 },
  { year: "Year 3", ebitda: 15.62, margin: 52.1 },
  { year: "Year 4", ebitda: 34.1, margin: 56.8 },
  { year: "Year 5", ebitda: 75.86, margin: 60.7 }
];

const COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#8b5cf6"];

export default function FinancialDashboard() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-white">Financial Model & Unit Economics</h2>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">5-year financial projections with detailed unit economics and profitability metrics.</p>
      </div>

      {/* Executive Summary Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-400">Year 5 Revenue</h3>
            <DollarSign className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-white">$125M</div>
          <p className="text-xs text-slate-400 mt-2">2.5M active users</p>
        </Card>

        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-400">Year 5 EBITDA</h3>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white">$75.9M</div>
          <p className="text-xs text-slate-400 mt-2">60.7% margin</p>
        </Card>

        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-400">Break-Even</h3>
            <Target className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white">Year 2</div>
          <p className="text-xs text-slate-400 mt-2">Month 8</p>
        </Card>

        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-400">CAC Payback</h3>
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">3 Months</div>
          <p className="text-xs text-slate-400 mt-2">$50 ARPU</p>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Total Revenue Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="year" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
              <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} dot={{ fill: "#f59e0b", r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue Mix (Year 5)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={revenueMixData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                {revenueMixData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Operating Expenses (Year 5)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={expenseData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">EBITDA & Margin Trajectory</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={profitData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="year" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
              <Legend />
              <Bar dataKey="ebitda" fill="#10b981" name="EBITDA ($M)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Financial Summary Table */}
      <Card className="p-6 bg-slate-800/50 border-slate-700/50 overflow-x-auto">
        <h3 className="text-lg font-semibold text-white mb-4">5-Year Financial Summary</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-4 text-slate-300 font-semibold">Year</th>
              <th className="text-right py-3 px-4 text-slate-300 font-semibold">Users</th>
              <th className="text-right py-3 px-4 text-slate-300 font-semibold">Revenue ($M)</th>
              <th className="text-right py-3 px-4 text-slate-300 font-semibold">Trading ($M)</th>
              <th className="text-right py-3 px-4 text-slate-300 font-semibold">Subs ($M)</th>
              <th className="text-right py-3 px-4 text-slate-300 font-semibold">Expenses ($M)</th>
              <th className="text-right py-3 px-4 text-slate-300 font-semibold">EBITDA ($M)</th>
              <th className="text-right py-3 px-4 text-slate-300 font-semibold">Margin</th>
            </tr>
          </thead>
          <tbody>
            {[
              { year: "Year 1", users: "100K", rev: "5.0", trading: "3.0", subs: "1.5", exp: "3.25", ebitda: "1.75", margin: "35.0%" },
              { year: "Year 2", users: "250K", rev: "12.5", trading: "7.5", subs: "3.75", exp: "6.88", ebitda: "5.62", margin: "45.0%" },
              { year: "Year 3", users: "600K", rev: "30.0", trading: "18.0", subs: "9.0", exp: "14.38", ebitda: "15.62", margin: "52.1%" },
              { year: "Year 4", users: "1.2M", rev: "60.0", trading: "36.0", subs: "18.0", exp: "25.90", ebitda: "34.10", margin: "56.8%" },
              { year: "Year 5", users: "2.5M", rev: "125.0", trading: "75.0", subs: "37.5", exp: "49.14", ebitda: "75.86", margin: "60.7%" }
            ].map((row, idx) => (
              <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition">
                <td className="py-3 px-4 text-white font-medium">{row.year}</td>
                <td className="py-3 px-4 text-right text-slate-300">{row.users}</td>
                <td className="py-3 px-4 text-right text-slate-300">${row.rev}</td>
                <td className="py-3 px-4 text-right text-slate-300">${row.trading}</td>
                <td className="py-3 px-4 text-right text-slate-300">${row.subs}</td>
                <td className="py-3 px-4 text-right text-slate-300">${row.exp}</td>
                <td className="py-3 px-4 text-right text-green-400 font-semibold">${row.ebitda}</td>
                <td className="py-3 px-4 text-right text-amber-400 font-semibold">{row.margin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Unit Economics */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Unit Economics Metrics</h3>
          <div className="space-y-4">
            {[
              { label: "CAC (Customer Acquisition Cost)", value: "$15", note: "Initial year; improves with scale" },
              { label: "ARPU (Annual Revenue Per User)", value: "$50", note: "Blended across all streams" },
              { label: "LTV (Lifetime Value)", value: "$250", note: "5-year average retention" },
              { label: "LTV:CAC Ratio", value: "16.7x", note: "Excellent unit economics" },
              { label: "CAC Payback Period", value: "3 months", note: "Time to recover acquisition cost" },
              { label: "Churn Rate", value: "5% monthly", note: "Conservative estimate" }
            ].map((metric, idx) => (
              <div key={idx} className="pb-4 border-b border-slate-700/50 last:border-b-0">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-slate-300 font-medium">{metric.label}</span>
                  <span className="text-amber-400 font-bold">{metric.value}</span>
                </div>
                <p className="text-xs text-slate-500">{metric.note}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Funding & Capital Requirements</h3>
          <div className="space-y-6">
            <div className="pb-6 border-b border-slate-700/50">
              <h4 className="text-sm font-semibold text-white mb-2">Series A Funding</h4>
              <div className="text-2xl font-bold text-amber-400 mb-1">$5M</div>
              <p className="text-sm text-slate-400">Product development, compliance, initial marketing</p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Capital Allocation</h4>
              <div className="space-y-3">
                {[
                  { cat: "Engineering & Product", pct: "40%", amt: "$2.0M" },
                  { cat: "Compliance & Legal", pct: "20%", amt: "$1.0M" },
                  { cat: "Marketing & Growth", pct: "24%", amt: "$1.2M" },
                  { cat: "Operations & Admin", pct: "16%", amt: "$0.8M" }
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-white">{item.cat}</p>
                      <p className="text-xs text-slate-500">{item.pct}</p>
                    </div>
                    <span className="text-amber-400 font-semibold">{item.amt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
