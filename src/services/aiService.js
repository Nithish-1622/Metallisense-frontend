import api from "./api";

// AI Health Check
export const checkAIHealth = () => api.get("/ai/health");

// Anomaly Detection - Direct endpoint
export const predictAnomaly = async (data) => {
  console.log("🔍 Anomaly Predict Request:", data);
  const response = await api.post("/ai/anomaly/predict", data);
  console.log("✅ Anomaly Predict Response:", response.data);
  return response;
};

// Individual Analysis (Anomaly + Alloy)
export const analyzeIndividual = (data) =>
  api.post("/ai/individual/analyze", data);

// AI Agent Analysis
export const analyzeAgent = (data) => api.post("/ai/agent/analyze", data);
