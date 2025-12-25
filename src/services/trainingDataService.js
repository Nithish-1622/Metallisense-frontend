import api from "./api";

// Get paginated training data (primary endpoint)
export const getPaginatedTrainingData = (params) =>
  api.get("/api/v2/training-data/paginated", { params });

// Get all training data
export const getAllTrainingData = (params) =>
  api.get("/api/v2/training-data", { params });

// Get training data by grade
export const getTrainingDataByGrade = (gradeName, params) =>
  api.get(`/api/v2/training-data/grade/${gradeName}`, { params });

// Get statistics for grade
export const getGradeStatistics = (gradeName) =>
  api.get(`/api/v2/training-data/grade/${gradeName}/statistics`);

// Create training data
export const createTrainingData = (data) =>
  api.post("/api/v2/training-data", data);

// Update training data
export const updateTrainingData = (id, data) =>
  api.patch(`/api/v2/training-data/${id}`, data);

// Delete training data
export const deleteTrainingData = (id) =>
  api.delete(`/api/v2/training-data/${id}`);
