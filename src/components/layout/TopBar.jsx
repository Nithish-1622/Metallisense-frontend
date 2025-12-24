import React from "react";
import OPCStatusIndicator from "./OPCStatusIndicator";

const TopBar = ({ title, actions }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-metal-200 px-6 py-4 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-10 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full shadow-md" />
          <h1 className="text-2xl font-bold text-metal-900">{title}</h1>
        </div>
        <div className="flex items-center gap-4">
          {actions}
          <OPCStatusIndicator />
        </div>
      </div>
    </div>
  );
};

export default TopBar;
