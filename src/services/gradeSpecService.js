import api from "./api";

// Get all grade specifications
export const getAllGradeSpecs = () => api.get("/api/v2/grades");

// Get single grade specification by ID
export const getGradeSpecById = (id) => api.get(`/api/v2/grades/${id}`);

// Get grade specification by name
export const getGradeSpecByName = (gradeName) =>
  api.get(`/api/v2/grades/${gradeName}`);

// Get composition ranges only
export const getGradeCompositionRanges = (gradeName) =>
  api.get(`/api/v2/grades/${gradeName}/composition`);

// Create new grade specification
export const createGradeSpec = (data) => api.post("/api/v2/grades", data);

// Update grade specification
export const updateGradeSpec = (id, data) =>
  api.patch(`/api/v2/grades/${id}`, data);

// Delete grade specification
export const deleteGradeSpec = (id) => api.delete(`/api/v2/grades/${id}`);
