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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* OPC Status Card */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-500">OPC Server</p>
              <p className="text-2xl font-bold text-dark-900 mt-1">
                {opcStatus.connected ? "Online" : "Offline"}
              </p>
            </div>
            <div
              className={`p-3 rounded-full ${
                opcStatus.connected ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <Activity
                size={24}
                className={
                  opcStatus.connected ? "text-green-600" : "text-red-600"
                }
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
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-500">Total Grades</p>
              <p className="text-2xl font-bold text-dark-900 mt-1">
                {stats.totalGrades}
              </p>
            </div>
            <div className="p-3 rounded-full bg-primary-100">
              <FileCheck size={24} className="text-primary-600" />
            </div>
          </div>
          <p className="text-xs text-dark-500 mt-4">
            Grade specifications defined
          </p>
        </Card>

        {/* Readings Card */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-500">
                Total Readings
              </p>
              <p className="text-2xl font-bold text-dark-900 mt-1">
                {stats.totalReadings}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Database size={24} className="text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-dark-500 mt-4">Spectrometer readings</p>
        </Card>

        {/* Anomalies Card */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-500">Anomalies</p>
              <p className="text-2xl font-bold text-dark-900 mt-1">
                {stats.totalAnomalies}
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <LayoutDashboard size={24} className="text-yellow-600" />
            </div>
          </div>
          <p className="text-xs text-dark-500 mt-4">Detected anomalies</p>
        </Card>
      </div>

      {/* Chart and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Readings Chart */}
        <Card title="Readings Over Time">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="readings"
                stroke="#16a34a"
                strokeWidth={2}
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
                className="flex items-start gap-3 pb-3 border-b border-dark-100 last:border-0"
              >
                <div className="mt-1">
                  <div className="h-2 w-2 rounded-full bg-primary-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-dark-900">
                    {activity.message}
                  </p>
                  <p className="text-xs text-dark-500 mt-1">{activity.time}</p>
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
