import React from "react";
import OPCStatusIndicator from "./OPCStatusIndicator";

const TopBar = ({ title, actions }) => {
  return (
    <div className="bg-white border-b border-dark-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-dark-900">{title}</h1>
        <div className="flex items-center gap-4">
          {actions}
          <OPCStatusIndicator />
        </div>
      </div>
    </div>
  );
};

export default TopBar;
