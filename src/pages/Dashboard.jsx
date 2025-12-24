import React, { useState, useEffect, useContext } from "react";
import { OPCContext } from "../context/OPCContext";
import { GradeContext } from "../context/GradeContext";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import { LayoutDashboard, Database, FileCheck, Activity } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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

  // Mock data for chart
  const chartData = [
    { name: "Mon", readings: 40 },
    { name: "Tue", readings: 30 },
    { name: "Wed", readings: 50 },
    { name: "Thu", readings: 45 },
    { name: "Fri", readings: 60 },
    { name: "Sat", readings: 35 },
    { name: "Sun", readings: 25 },
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
    <div className="space-y-6">
      {/* Stats Grid */}
      <div data-tour="dashboard-stats" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* OPC Status Card */}
        <Card className="hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-metal-600">OPC Server</p>
              <p className="text-3xl font-bold text-metal-900 mt-1">
                {opcStatus.connected ? "Online" : "Offline"}
              </p>
            </div>
            <div
              className={`p-4 rounded-xl ${
                opcStatus.connected ? "bg-gradient-to-br from-primary-500 to-primary-600 shadow-metal" : "bg-gradient-to-br from-red-500 to-red-600"
              }`}
            >
              <Activity
                size={28}
                className="text-white"
              />
            </div>
          </div>
          <div className="mt-4">
            <Badge variant={opcStatus.connected ? "success" : "error"}>
              {opcStatus.connected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
        </Card>

        {/* Grades Card */}
        <Card className="hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-metal-600">Total Grades</p>
              <p className="text-3xl font-bold text-metal-900 mt-1">
                {stats.totalGrades}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary-500 to-accent-600 shadow-metal">
              <FileCheck size={28} className="text-white" />
            </div>
          </div>
          <p className="text-xs text-metal-600 mt-4 font-medium">
            Grade specifications defined
          </p>
        </Card>

        {/* Readings Card */}
        <Card className="hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-metal-600">
                Total Readings
              </p>
              <p className="text-3xl font-bold text-metal-900 mt-1">
                {stats.totalReadings}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
              <Database size={28} className="text-white" />
            </div>
          </div>
          <p className="text-xs text-metal-600 mt-4 font-medium">Spectrometer readings</p>
        </Card>

        {/* Anomalies Card */}
        <Card className="hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-metal-600">Anomalies</p>
              <p className="text-3xl font-bold text-metal-900 mt-1">
                {stats.totalAnomalies}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg">
              <LayoutDashboard size={28} className="text-white" />
            </div>
          </div>
          <p className="text-xs text-metal-600 mt-4 font-medium">Detected anomalies</p>
        </Card>
      </div>

      {/* Chart and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Readings Chart */}
        <Card title="Readings Over Time">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5eaef" />
              <XAxis dataKey="name" stroke="#6b7f94" />
              <YAxis stroke="#6b7f94" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  borderRadius: '12px', 
                  border: '2px solid #e5eaef',
                  boxShadow: '0 2px 8px rgba(15, 194, 107, 0.1)'
                }}
              />
              <Line
                type="monotone"
                dataKey="readings"
                stroke="#15c26b"
                strokeWidth={3}
                dot={{ fill: '#15c26b', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Recent Activity */}
        <Card title="Recent Activity">
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 pb-4 border-b border-metal-100 last:border-0 hover:bg-metal-50 p-2 rounded-lg transition-all"
              >
                <div className="mt-1.5">
                  <div className="h-3 w-3 rounded-full bg-gradient-metal shadow-metal" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-metal-900">
                    {activity.message}
                  </p>
                  <p className="text-xs text-metal-500 mt-1 font-medium">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
