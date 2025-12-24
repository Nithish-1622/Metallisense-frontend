import React, { useState, useEffect, useContext } from "react";
import { OPCContext } from "../context/OPCContext";
import { GradeContext } from "../context/GradeContext";
import { LayoutDashboard, Database, FileCheck, Activity } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Dashboard = () => {
  const { opcStatus } = useContext(OPCContext);
  const { grades } = useContext(GradeContext);
  const [stats, setStats] = useState({
    totalReadings: 0,
    totalAnomalies: 0,
    totalGrades: 0,
  });

  useEffect(() => {
    // Fetch dashboard stats
    setStats({
      totalReadings: 1234,
      totalAnomalies: 12,
      totalGrades: grades.length,
    });
  }, [grades]);

  // Mock data for charts
  const chartData = [
    { name: "Mon", readings: 40 },
    { name: "Tue", readings: 30 },
    { name: "Wed", readings: 50 },
    { name: "Thu", readings: 45 },
    { name: "Fri", readings: 60 },
    { name: "Sat", readings: 35 },
    { name: "Sun", readings: 25 },
  ];

  const weeklyAnomaliesData = [
    { day: "Mon", anomalies: 2 },
    { day: "Tue", anomalies: 1 },
    { day: "Wed", anomalies: 3 },
    { day: "Thu", anomalies: 2 },
    { day: "Fri", anomalies: 1 },
    { day: "Sat", anomalies: 2 },
    { day: "Sun", anomalies: 1 },
  ];

  const gradeDistributionData = [
    { name: "AISI 1018", value: 30, color: "#10b981" },
    { name: "AISI 1020", value: 25, color: "#059669" },
    { name: "AISI 1045", value: 20, color: "#047857" },
    { name: "Custom", value: 15, color: "#065f46" },
    { name: "Others", value: 10, color: "#064e3b" },
  ];

  const recentActivity = [
    {
      id: 1,
      type: "reading",
      message: "Reading received - AISI 1018",
      time: "2 mins ago",
    },
    {
      id: 2,
      type: "anomaly",
      message: "Anomaly detected - AISI 1020",
      time: "15 mins ago",
    },
    {
      id: 3,
      type: "grade",
      message: "Grade added - Custom Steel",
      time: "1 hour ago",
    },
    {
      id: 4,
      type: "reading",
      message: "Reading received - AISI 1045",
      time: "2 hours ago",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <LayoutDashboard className="text-emerald-700 text-3xl" size={32} />
            <h1 className="text-3xl md:text-4xl font-light text-slate-800 tracking-wide">
              MetalliSense Dashboard
            </h1>
          </div>
          <p className="text-slate-600 text-lg font-light leading-relaxed">
            Real-time monitoring and analytics for spectrometer operations
          </p>
        </div>

        {/* KPI Cards */}
        <div
          data-tour="dashboard-stats"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
        >
          {/* OPC Status Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">
                  OPC Server
                </p>
                <p className="text-2xl font-light text-slate-800 mt-2">
                  {opcStatus.connected ? "Online" : "Offline"}
                </p>
              </div>
              <Activity
                size={24}
                className={
                  opcStatus.connected ? "text-emerald-500" : "text-red-500"
                }
              />
            </div>
            <div className="flex items-center gap-2 mt-4">
              <div
                className={`w-2 h-2 rounded-full ${
                  opcStatus.connected ? "bg-emerald-500" : "bg-red-500"
                }`}
              />
              <span className="text-xs text-slate-500">
                {opcStatus.connected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>

          {/* Grades Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">
                  Total Grades
                </p>
                <p className="text-2xl font-light text-slate-800 mt-2">
                  {stats.totalGrades}
                </p>
              </div>
              <FileCheck className="text-emerald-500 text-2xl" size={24} />
            </div>
            <p className="text-xs text-slate-500 mt-4">
              Grade specifications defined
            </p>
          </div>

          {/* Readings Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">
                  Total Readings
                </p>
                <p className="text-2xl font-light text-slate-800 mt-2">
                  {stats.totalReadings}
                </p>
              </div>
              <Database className="text-emerald-500 text-2xl" size={24} />
            </div>
            <p className="text-xs text-slate-500 mt-4">Spectrometer readings</p>
          </div>

          {/* Anomalies Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">
                  Anomalies
                </p>
                <p className="text-2xl font-light text-slate-800 mt-2">
                  {stats.totalAnomalies}
                </p>
              </div>
              <LayoutDashboard className="text-amber-500 text-2xl" size={24} />
            </div>
            <p className="text-xs text-slate-500 mt-4">Detected anomalies</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Readings Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-slate-800 mb-4">
              Readings Over Time
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="readings"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Anomalies Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-slate-800 mb-4">
              Weekly Anomalies
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyAnomaliesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="anomalies" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Grade Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-slate-800 mb-4">
              Grade Distribution
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={gradeDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                >
                  {gradeDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-slate-800 mb-6">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 p-3 rounded-lg transition-all duration-200"
              >
                <div className="mt-1.5">
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">
                    {activity.message}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
