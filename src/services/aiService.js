import api from "./api";

// AI Health Check
export const checkAIHealth = () => api.get("/api/v2/ai/health");

// Individual Analysis (Anomaly + Alloy)
export const analyzeIndividual = (data) =>
  api.post("/api/v2/ai/individual/analyze", data);

// AI Agent Analysis
export const analyzeAgent = (data) =>
  api.post("/api/v2/ai/agent/analyze", data);

// AI Explanation Services (Google Gemini Integration)
// Analyze reading with AI-powered explanation
export const analyzeWithExplanation = (data) =>
  api.post("/api/v2/ai/analyze-with-explanation", data);

// Get AI explanation for specific results
export const explainResult = (data) =>
  api.post("/api/v2/ai/explain", data);

// Run what-if scenario analysis
export const whatIfAnalysis = (data) =>
  api.post("/api/v2/ai/what-if", data);
