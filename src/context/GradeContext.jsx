import React, { createContext, useState, useEffect } from "react";
import { getAllGrades } from "../services/gradeService";

export const GradeContext = createContext();

export const GradeProvider = ({ children }) => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGrades = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllGrades(params);
      setGrades(response.data.data || []);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to fetch grades";
      setError(errorMsg);
      console.error("Failed to fetch grades:", err);
      return { error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const refreshGrades = () => {
    fetchGrades();
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  return (
    <GradeContext.Provider
      value={{ grades, loading, error, fetchGrades, refreshGrades }}
    >
      {children}
    </GradeContext.Provider>
  );
};
