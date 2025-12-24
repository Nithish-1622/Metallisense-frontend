import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { useLocation } from "react-router-dom";

const pageTitles = {
  "/": "Dashboard",
  "/dashboard": "Dashboard",
  "/onboard": "Onboard Tour",
  "/anomaly": "Anomaly Detection",
  "/recommendation": "Alloy Recommendation",
  "/agent": "AI Agent Analysis",
  "/grades": "Grade Specifications",
  "/synthetic": "Synthetic Data Generator",
  "/spectrometer": "Spectrometer Readings",
  "/training-data": "Training Data Management",
};

const MainLayout = () => {
  const location = useLocation();
  const title = pageTitles[location.pathname] || "MetalliSense";

  return (
    <div className="flex h-screen bg-dark-50">
      <Sidebar />
      <div className="flex-1 ml-72 flex flex-col overflow-hidden">
        <TopBar title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
