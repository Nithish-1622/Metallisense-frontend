import api from "./api";

// Get all grades
export const getAllGrades = (params) => api.get("/api/v2/grades", { params });

// Create new grade
export const createGrade = (data) => api.post("/api/v2/grades", data);

// Get grade by name
export const getGradeByName = (gradeName) =>
  api.get(`/api/v2/grades/${gradeName}`);

// Get grade composition
export const getGradeComposition = (gradeName) =>
  api.get(`/api/v2/grades/${gradeName}/composition`);

// Update grade
export const updateGrade = (id, data) =>
  api.patch(`/api/v2/grades/${id}`, data);

// Delete grade
export const deleteGrade = (id) => api.delete(`/api/v2/grades/${id}`);
