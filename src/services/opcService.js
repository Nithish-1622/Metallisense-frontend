import api from "./api";

// OPC Status
export const getOPCStatus = () => api.get("/api/v2/synthetic/opc-status");

// OPC Connect
export const connectOPC = () => api.post("/api/v2/synthetic/opc-connect");

// OPC Disconnect
export const disconnectOPC = () => api.post("/api/v2/synthetic/opc-disconnect");

// Generate Synthetic Reading
export const generateSyntheticReading = (data) =>
  api.post("/api/v2/synthetic/generate-synthetic", data);
