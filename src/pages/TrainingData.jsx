import React, { useState, useEffect } from "react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import Input from "../components/common/Input";
import Badge from "../components/common/Badge";
import Select from "../components/common/Select";
import { Plus, Edit, Trash2, Eye, Filter } from "lucide-react";
import {
  getAllTrainingData,
  getTrainingDataByGrade,
  getGradeStatistics,
  createTrainingData,
  updateTrainingData,
  deleteTrainingData,
} from "../services/trainingDataService";
import { getAllGradeSpecs } from "../services/gradeSpecService";
import toast from "react-hot-toast";
import { formatPercentage } from "../utils/formatters";

const TrainingData = () => {
  const [trainingData, setTrainingData] = useState([]);
  const [availableGrades, setAvailableGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);

  // Filters
  const [gradeFilter, setGradeFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingSample, setEditingSample] = useState(null);
  const [selectedSample, setSelectedSample] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    grade: "",
    Fe: 0,
    C: 0,
    Si: 0,
    Mn: 0,
    P: 0,
    S: 0,
    deviated: 0,
    severity: "none",
    sample_type: "normal",
  });

  useEffect(() => {
    fetchGrades();
    fetchTrainingData();
  }, []);

  useEffect(() => {
    fetchTrainingData();
  }, [gradeFilter, typeFilter, severityFilter]);

  useEffect(() => {
    if (gradeFilter !== "all") {
      fetchStatistics(gradeFilter);
    } else {
      setStatistics(null);
    }
  }, [gradeFilter]);

  const fetchGrades = async () => {
    try {
      const response = await getAllGradeSpecs();
      console.log("Grade specs response:", response.data);
      const grades = response.data.data?.data || [];
      console.log("Extracted grades:", grades);
      const gradeNames = grades.map((g) => g.grade);
      console.log("Grade names:", gradeNames);
      setAvailableGrades(gradeNames);
    } catch (error) {
      console.error("Failed to fetch grades:", error);
      toast.error("Failed to load available grades");
    }
  };

  const fetchTrainingData = async () => {
    setLoading(true);
    try {
      let response;
      const params = {
        limit: 100, // Limit to 100 records for performance
        page: 1,
      };

      if (typeFilter !== "all") {
        params.sample_type = typeFilter;
      }

      if (gradeFilter !== "all") {
        console.log(
          "Fetching training data for grade:",
          gradeFilter,
          "with params:",
          params
        );
        response = await getTrainingDataByGrade(gradeFilter, params);
      } else {
        console.log("Fetching all training data with params:", params);
        response = await getAllTrainingData(params);
      }

      console.log("Training data response:", response.data);
      let data = response.data.data?.data || [];
      console.log("Extracted training data:", data.length, "records");

      // Apply severity filter
      if (severityFilter !== "all") {
        data = data.filter((sample) => sample.severity === severityFilter);
        console.log("After severity filter:", data.length, "records");
      }

      setTrainingData(data);
    } catch (error) {
      console.error("Failed to fetch training data:", error);
      toast.error("Failed to load training data");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async (grade) => {
    try {
      const response = await getGradeStatistics(grade);
      setStatistics(response.data.data);
    } catch (error) {
      console.error("Failed to fetch statistics:", error);
    }
  };

  const handleOpenModal = (sample = null) => {
    if (sample) {
      setEditingSample(sample);
      setFormData({
        grade: sample.grade,
        Fe: sample.Fe,
        C: sample.C,
        Si: sample.Si,
        Mn: sample.Mn,
        P: sample.P,
        S: sample.S,
        deviated: sample.deviated,
        severity: sample.severity,
        sample_type: sample.sample_type,
      });
    } else {
      setEditingSample(null);
      setFormData({
        grade: "",
        Fe: 0,
        C: 0,
        Si: 0,
        Mn: 0,
        P: 0,
        S: 0,
        deviated: 0,
        severity: "none",
        sample_type: "normal",
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingSample(null);
  };

  const handleViewSample = (sample) => {
    setSelectedSample(sample);
    setViewModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingSample) {
        await updateTrainingData(editingSample._id, formData);
        toast.success("Training data updated successfully");
      } else {
        await createTrainingData(formData);
        toast.success("Training data created successfully");
      }
      handleCloseModal();
      fetchTrainingData();
    } catch (error) {
      console.error("Failed to save training data:", error);
      toast.error(
        error.response?.data?.message || "Failed to save training data"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this training sample?")
    )
      return;

    try {
      await deleteTrainingData(id);
      toast.success("Training data deleted successfully");
      fetchTrainingData();
    } catch (error) {
      console.error("Failed to delete training data:", error);
      toast.error("Failed to delete training data");
    }
  };

  const getSeverityBadge = (severity) => {
    const variants = {
      none: "info",
      mild: "warning",
      moderate: "warning",
      severe: "danger",
    };
    return (
      <Badge variant={variants[severity] || "info"}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getTypeBadge = (type) => {
    return (
      <Badge variant={type === "normal" ? "success" : "danger"}>
        {type.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-900">
            Training Data Management
          </h1>
          <p className="text-dark-600 mt-1">
            Manage AI training samples with classifications and severity levels
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={18} className="inline mr-2" />
          Add Training Sample
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-dark-600" />
          <h3 className="font-semibold text-dark-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label="Grade"
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            options={[
              { value: "all", label: "All Grades" },
              ...availableGrades.map((g) => ({ value: g, label: g })),
            ]}
          />
          <Select
            label="Sample Type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { value: "all", label: "All Types" },
              { value: "normal", label: "Normal" },
              { value: "deviated", label: "Deviated" },
            ]}
          />
          <Select
            label="Severity"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            options={[
              { value: "all", label: "All Severities" },
              { value: "none", label: "None" },
              { value: "mild", label: "Mild" },
              { value: "moderate", label: "Moderate" },
              { value: "severe", label: "Severe" },
            ]}
          />
          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={() => {
                setGradeFilter("all");
                setTypeFilter("all");
                setSeverityFilter("all");
              }}
              className="w-full"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Statistics Dashboard */}
      {statistics && (
        <Card title={`Statistics for ${gradeFilter}`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="text-3xl font-bold text-green-600">
                {statistics.total_samples || 0}
              </div>
              <div className="text-sm text-green-700 mt-1">Total Samples</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="text-3xl font-bold text-blue-600">
                {statistics.normal_samples || 0}
              </div>
              <div className="text-sm text-blue-700 mt-1">Normal Samples</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
              <div className="text-3xl font-bold text-red-600">
                {statistics.deviated_samples || 0}
              </div>
              <div className="text-sm text-red-700 mt-1">Deviated Samples</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
              <div className="text-lg font-bold text-orange-600">
                {statistics.severity_breakdown?.severe || 0} Severe
              </div>
              <div className="text-sm text-orange-700 mt-1">
                {statistics.severity_breakdown?.moderate || 0} Moderate,{" "}
                {statistics.severity_breakdown?.mild || 0} Mild
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Table */}
      <Card>
        {loading ? (
          <div className="text-center py-12 text-dark-500">
            Loading training data...
          </div>
        ) : trainingData.length === 0 ? (
          <div className="text-center py-12 text-dark-500">
            No training data found matching your filters
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-dark-200">
              <thead className="bg-dark-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-dark-700 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-dark-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-dark-700 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-dark-700 uppercase tracking-wider">
                    Fe
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-dark-700 uppercase tracking-wider">
                    C
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-dark-700 uppercase tracking-wider">
                    Si
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-dark-700 uppercase tracking-wider">
                    Deviated
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-dark-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-dark-200">
                {trainingData.map((sample) => (
                  <tr key={sample._id} className="hover:bg-dark-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono font-bold text-dark-900">
                        {sample.grade}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getTypeBadge(sample.sample_type)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getSeverityBadge(sample.severity)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-dark-900">
                      {formatPercentage(sample.Fe)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-dark-900">
                      {formatPercentage(sample.C)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-dark-900">
                      {formatPercentage(sample.Si)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      {sample.deviated === 1 ? (
                        <span className="text-red-600 font-bold">✓</span>
                      ) : (
                        <span className="text-green-600 font-bold">✗</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewSample(sample)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenModal(sample)}
                          className="text-primary-600 hover:text-primary-800"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(sample._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={
          editingSample ? "Edit Training Sample" : "Add New Training Sample"
        }
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grade Selection */}
          <Select
            label="Metal Grade *"
            value={formData.grade}
            onChange={(e) =>
              setFormData({ ...formData, grade: e.target.value })
            }
            options={[
              { value: "", label: "Select a grade..." },
              ...availableGrades.map((g) => ({ value: g, label: g })),
            ]}
            required
          />

          {/* Composition Values */}
          <div>
            <h3 className="text-lg font-semibold text-dark-900 mb-3">
              Composition Values (%) *
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {["Fe", "C", "Si", "Mn", "P", "S"].map((element) => (
                <Input
                  key={element}
                  label={element}
                  type="number"
                  step="0.01"
                  value={formData[element]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [element]: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                  containerClassName="mb-0"
                />
              ))}
            </div>
          </div>

          {/* Classification */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Sample Type *"
              value={formData.sample_type}
              onChange={(e) =>
                setFormData({ ...formData, sample_type: e.target.value })
              }
              options={[
                { value: "normal", label: "Normal" },
                { value: "deviated", label: "Deviated" },
              ]}
              required
            />

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Deviated *
              </label>
              <div className="flex items-center gap-4 h-10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="deviated"
                    value={0}
                    checked={formData.deviated === 0}
                    onChange={() => setFormData({ ...formData, deviated: 0 })}
                    className="w-4 h-4"
                  />
                  <span>No (0)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="deviated"
                    value={1}
                    checked={formData.deviated === 1}
                    onChange={() => setFormData({ ...formData, deviated: 1 })}
                    className="w-4 h-4"
                  />
                  <span>Yes (1)</span>
                </label>
              </div>
            </div>

            <Select
              label="Severity *"
              value={formData.severity}
              onChange={(e) =>
                setFormData({ ...formData, severity: e.target.value })
              }
              options={[
                { value: "none", label: "None" },
                { value: "mild", label: "Mild" },
                { value: "moderate", label: "Moderate" },
                { value: "severe", label: "Severe" },
              ]}
              required
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-dark-200">
            <Button
              variant="secondary"
              onClick={handleCloseModal}
              type="button"
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingSample ? "Update" : "Create"} Training Sample
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Training Sample Details"
        size="lg"
      >
        {selectedSample && (
          <div className="space-y-6">
            {/* Sample Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-dark-50 rounded-lg">
              <div>
                <p className="text-sm text-dark-600">Grade</p>
                <p className="text-lg font-bold font-mono text-dark-900">
                  {selectedSample.grade}
                </p>
              </div>
              <div>
                <p className="text-sm text-dark-600">Sample Type</p>
                <div className="mt-1">
                  {getTypeBadge(selectedSample.sample_type)}
                </div>
              </div>
              <div>
                <p className="text-sm text-dark-600">Deviated</p>
                <p className="text-lg font-semibold text-dark-900">
                  {selectedSample.deviated === 1 ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <p className="text-sm text-dark-600">Severity</p>
                <div className="mt-1">
                  {getSeverityBadge(selectedSample.severity)}
                </div>
              </div>
            </div>

            {/* Composition */}
            <div>
              <h3 className="text-lg font-semibold text-dark-900 mb-3">
                Composition
              </h3>
              <div className="overflow-hidden border border-dark-200 rounded-lg">
                <table className="min-w-full divide-y divide-dark-200">
                  <thead className="bg-dark-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-dark-700 uppercase">
                        Element
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-dark-700 uppercase">
                        Value (%)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-200">
                    {["Fe", "C", "Si", "Mn", "P", "S"].map((element) => (
                      <tr key={element}>
                        <td className="px-4 py-2 font-mono font-bold text-dark-900">
                          {element}
                        </td>
                        <td className="px-4 py-2 text-lg font-semibold text-dark-900">
                          {formatPercentage(selectedSample[element])}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dark-200 text-xs text-dark-500">
              <div>
                <p>
                  Created: {new Date(selectedSample.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p>
                  Updated: {new Date(selectedSample.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TrainingData;
