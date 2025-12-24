import React, { useState, useEffect, useContext } from "react";
import { OPCContext } from "../../context/OPCContext";

const OPCStatusIndicator = () => {
  const { opcStatus } = useContext(OPCContext);

  return (
    <div
      data-tour="opc-status"
      className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-dark-200"
    >
      <div
        className={`h-3 w-3 rounded-full ${
          opcStatus.connected ? "bg-green-500 animate-pulse" : "bg-red-500"
        }`}
      />
      <span className="text-sm font-medium text-dark-700">
        {opcStatus.connected ? "OPC Connected" : "OPC Disconnected"}
      </span>
    </div>
  );
};

export default OPCStatusIndicator;
