import React, { useState, useEffect, useContext } from "react";
import { OPCContext } from "../context/OPCContext";
import { GradeContext } from "../context/GradeContext";
import { LayoutDashboard, Database, FileCheck, Activity } from "lucide-react";
import { getTrainingDataVisualizations } from "../services/trainingDataService";
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
  Legend,
} from "recharts";

const Dashboard = () => {
  const { opcStatus } = useContext(OPCContext);
  const { grades } = useContext(GradeContext);
  const [stats, setStats] = useState({
    totalReadings: 0,
    totalAnomalies: 0,
    totalGrades: 0,
  });
  const [visualizationData, setVisualizationData] = useState(null);
  const [loadingVisualizations, setLoadingVisualizations] = useState(true);
  const [selectedElement, setSelectedElement] = useState("Fe");

  useEffect(() => {
    // Fetch dashboard stats
    setStats({
      totalReadings: 1234,
      totalAnomalies: 12,
      totalGrades: grades.length,
    });
  }, [grades]);

  useEffect(() => {
    // Fetch training data visualizations
    const fetchVisualizations = async () => {
      try {
        setLoadingVisualizations(true);
        const response = await getTrainingDataVisualizations();
        setVisualizationData(response.data.data);
      } catch (error) {
        console.error("Error fetching visualization data:", error);
      } finally {
        setLoadingVisualizations(false);
      }
    };
    fetchVisualizations();
  }, []);

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
            <LayoutDashboard className="text-emerald-700 text-3xl" size={33} />
            <h1 className="text-3xl font-bold md:text-4xl  text-slate-800 tracking-wide">
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

        {/* Training Data Analytics Section */}
        {loadingVisualizations ? (
          <div className="mt-10 bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-emerald-600 text-xl font-medium">
              Loading Training Data Analytics...
            </div>
          </div>
        ) : visualizationData ? (
          <div className="mt-10">
            {/* Section Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">
                Training Data Analytics
              </h2>
              <p className="text-slate-600 text-lg">
                Comprehensive insights from{" "}
                {visualizationData.overview?.totalSamples?.toLocaleString()}{" "}
                training samples
              </p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6 hover:shadow-md transition-shadow">
                <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wide mb-2">
                  Total Samples
                </h3>
                <p className="text-4xl font-bold text-emerald-600">
                  {visualizationData.overview?.totalSamples?.toLocaleString()}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6 hover:shadow-md transition-shadow">
                <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wide mb-2">
                  Normal Samples
                </h3>
                <p className="text-4xl font-bold text-emerald-600">
                  {visualizationData.overview?.normalSamples?.toLocaleString()}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {(
                    (visualizationData.overview?.normalSamples /
                      visualizationData.overview?.totalSamples) *
                    100
                  ).toFixed(1)}
                  %
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6 hover:shadow-md transition-shadow">
                <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wide mb-2">
                  Deviated Samples
                </h3>
                <p className="text-4xl font-bold text-emerald-600">
                  {visualizationData.overview?.deviatedSamples?.toLocaleString()}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {(
                    (visualizationData.overview?.deviatedSamples /
                      visualizationData.overview?.totalSamples) *
                    100
                  ).toFixed(1)}
                  %
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6 hover:shadow-md transition-shadow">
                <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wide mb-2">
                  Severe Issues
                </h3>
                <p className="text-4xl font-bold text-emerald-600">
                  {visualizationData.overview?.severitySevere?.toLocaleString()}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {(
                    (visualizationData.overview?.severitySevere /
                      visualizationData.overview?.totalSamples) *
                    100
                  ).toFixed(1)}
                  %
                </p>
              </div>
            </div>

            {/* First Row: Grade Distribution and Sample Type */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Grade Distribution Pie Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-slate-800 mb-4">
                  Grade Distribution
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={visualizationData.gradeDistribution?.map(
                        (item) => ({
                          name: item._id,
                          value: item.total,
                        })
                      )}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={110}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {visualizationData.gradeDistribution?.map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              [
                                "#10b981",
                                "#059669",
                                "#047857",
                                "#065f46",
                                "#064e3b",
                              ][index % 5]
                            }
                          />
                        )
                      )}
                      }
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Sample Type Donut Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-slate-800 mb-4">
                  Sample Types
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={visualizationData.sampleTypeDistribution?.map(
                        (item) => ({
                          name: item._id === "normal" ? "Normal" : "Deviated",
                          value: item.count,
                        })
                      )}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={110}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) =>
                        `${name}: ${value.toLocaleString()}`
                      }
                    >
                      {visualizationData.sampleTypeDistribution?.map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry._id === "normal" ? "#10b981" : "#047857"
                            }
                          />
                        )
                      )}
                      }
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

            {/* Second Row: Severity and Grade Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Severity Distribution Bar Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-slate-800 mb-4">
                  Severity Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={visualizationData.severityDistribution?.map(
                      (item) => ({
                        severity:
                          item._id.charAt(0).toUpperCase() + item._id.slice(1),
                        count: item.count,
                      })
                    )}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="severity" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Stacked Bar Chart - Grade vs Sample Type */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-slate-800 mb-4">
                  Normal vs Deviated by Grade
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={visualizationData.gradeTypeBreakdown?.map((item) => {
                      const normalCount =
                        item.data.find((d) => d.sample_type === "normal")
                          ?.count || 0;
                      const deviatedCount =
                        item.data.find((d) => d.sample_type === "deviated")
                          ?.count || 0;
                      return {
                        grade: item._id,
                        normal: normalCount,
                        deviated: deviatedCount,
                      };
                    })}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="grade"
                      stroke="#64748b"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      fontSize={12}
                    />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="normal"
                      stackId="a"
                      fill="#10b981"
                      name="Normal"
                    />
                    <Bar
                      dataKey="deviated"
                      stackId="a"
                      fill="#047857"
                      name="Deviated"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Third Row: Composition Range Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-slate-800">
                  {selectedElement} Composition by Grade
                </h3>
                <select
                  value={selectedElement}
                  onChange={(e) => setSelectedElement(e.target.value)}
                  className="bg-slate-100 border border-slate-300 text-slate-800 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Fe">Iron (Fe)</option>
                  <option value="C">Carbon (C)</option>
                  <option value="Si">Silicon (Si)</option>
                  <option value="Mn">Manganese (Mn)</option>
                  <option value="P">Phosphorus (P)</option>
                  <option value="S">Sulfur (S)</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={visualizationData.compositionByGrade?.map((item) => ({
                    grade: item._id,
                    avg: parseFloat(
                      item[`avg${selectedElement}`]?.toFixed(3) || 0
                    ),
                    min: parseFloat(
                      item[`min${selectedElement}`]?.toFixed(3) || 0
                    ),
                    max: parseFloat(
                      item[`max${selectedElement}`]?.toFixed(3) || 0
                    ),
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="grade"
                    stroke="#64748b"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={12}
                  />
                  <YAxis
                    stroke="#64748b"
                    label={{
                      value: `${selectedElement} %`,
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="min" fill="#047857" name="Min" />
                  <Bar dataKey="avg" fill="#10b981" name="Average" />
                  <Bar dataKey="max" fill="#059669" name="Max" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Fourth Row: Element Histogram */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-medium text-slate-800 mb-4">
                {selectedElement} Distribution Histogram
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={visualizationData.elementDistributions?.[
                    selectedElement
                  ]?.map((bucket) => ({
                    range: bucket._id === "Other" ? "Other" : `${bucket._id}+`,
                    count: bucket.count,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="range" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Fifth Row: Severity Heatmap */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-medium text-slate-800 mb-4">
                Severity Heatmap
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="px-4 py-3 text-left text-slate-700 font-semibold">
                        Grade
                      </th>
                      {["none", "mild", "moderate", "severe"].map((level) => (
                        <th
                          key={level}
                          className="px-4 py-3 text-center text-slate-700 font-semibold"
                        >
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visualizationData.severityByGrade?.map((gradeData) => {
                      const getSeverityCount = (severity) => {
                        const found = gradeData.severities.find(
                          (s) => s.severity === severity
                        );
                        return found ? found.count : 0;
                      };

                      const getColorClass = (count) => {
                        const maxCount = Math.max(
                          ...visualizationData.severityByGrade.flatMap((g) =>
                            g.severities.map((s) => s.count)
                          )
                        );
                        const percentage = (count / maxCount) * 100;
                        if (percentage > 75) return "bg-emerald-700 text-white";
                        if (percentage > 50) return "bg-emerald-600 text-white";
                        if (percentage > 25) return "bg-emerald-500 text-white";
                        return "bg-emerald-400 text-white";
                      };

                      return (
                        <tr
                          key={gradeData._id}
                          className="border-b border-slate-100 hover:bg-slate-50"
                        >
                          <td className="px-4 py-3 text-slate-800 font-semibold">
                            {gradeData._id}
                          </td>
                          {["none", "mild", "moderate", "severe"].map(
                            (level) => {
                              const count = getSeverityCount(level);
                              return (
                                <td
                                  key={level}
                                  className="px-4 py-3 text-center"
                                >
                                  <div
                                    className={`${getColorClass(
                                      count
                                    )} px-3 py-2 rounded inline-block min-w-[80px] font-medium`}
                                  >
                                    {count.toLocaleString()}
                                  </div>
                                </td>
                              );
                            }
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Dashboard;
