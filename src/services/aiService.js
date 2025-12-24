import api from "./api";

// AI Health Check
export const checkAIHealth = () => api.get("/api/v2/ai/health");

// Individual Analysis (Anomaly + Alloy)
export const analyzeIndividual = (data) =>
  api.post("/api/v2/ai/individual/analyze", data);

// AI Agent Analysis
export const analyzeAgent = (data) =>
  api.post("/api/v2/ai/agent/analyze", data);
