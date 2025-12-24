import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  GraduationCap,
  AlertTriangle,
  Lightbulb,
  Bot,
  FileCheck,
  Cpu,
  Microscope,
  Database,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";

const sidebarItems = [
  {
    id: "onboard-tour",
    label: "Onboard Tour",
    icon: GraduationCap,
    path: "/onboard",
  },
  {
    id: "anomaly-detection",
    label: "Anomaly Detection",
    icon: AlertTriangle,
    path: "/anomaly",
  },
  {
    id: "recommendation",
    label: "Recommendation",
    icon: Lightbulb,
    path: "/recommendation",
  },
  {
    id: "agent",
    label: "AI Agent",
    icon: Bot,
    path: "/agent",
  },
  {
    id: "grades",
    label: "Grade Specs",
    icon: FileCheck,
    path: "/grades",
  },
  {
    id: "synthetic-data",
    label: "Synthetic Data",
    icon: Cpu,
    path: "/synthetic",
  },
  {
    id: "spectrometer",
    label: "Spectrometer",
    icon: Microscope,
    path: "/spectrometer",
  },
  {
    id: "training-data",
    label: "Training Data",
    icon: Database,
    path: "/training-data",
  },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      data-tour="sidebar"
      className={clsx(
        "bg-dark-800 h-screen fixed left-0 top-0 transition-all duration-300 border-r border-dark-700",
        collapsed ? "w-20" : "w-72"
      )}
    >
      {/* Header */}
      <div className="px-4 py-6 border-b border-dark-700">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <h2 className="text-xl font-bold text-white">MetalliSense</h2>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-dark-700 text-white transition-colors ml-auto"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {sidebarItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group",
                isActive
                  ? "bg-primary-600 text-white"
                  : "text-dark-300 hover:bg-dark-700 hover:text-white"
              )
            }
          >
            <item.icon size={20} className="flex-shrink-0" />
            {!collapsed && (
              <span className="text-sm font-medium">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
