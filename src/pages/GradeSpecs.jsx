import React, { useState, useContext } from "react";
import { GradeContext } from "../context/GradeContext";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Table from "../components/common/Table";
import Modal from "../components/common/Modal";
import Input from "../components/common/Input";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import {
  createGrade,
  updateGrade,
  deleteGrade,
} from "../services/gradeService";
import toast from "react-hot-toast";
import { ELEMENT_SYMBOLS } from "../utils/constants";

const GradeSpecs = () => {
  const { grades, loading, refreshGrades } = useContext(GradeContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [formData, setFormData] = useState({
    gradeName: "",
    description: "",
    composition: {},
  });
  const [submitting, setSubmitting] = useState(false);

  // Ensure grades is always an array
  const safeGrades = Array.isArray(grades) ? grades : [];
  const filteredGrades = safeGrades.filter((grade) =>
    grade.gradeName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (grade = null) => {
    if (grade) {
      setEditingGrade(grade);
      setFormData({
        gradeName: grade.gradeName,
        description: grade.description || "",
        composition: grade.composition || {},
      });
    } else {
      setEditingGrade(null);
      setFormData({
        gradeName: "",
        description: "",
        composition: {},
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingGrade(null);
    setFormData({
      gradeName: "",
      description: "",
      composition: {},
    });
  };

  const handleAddElement = (element) => {
    setFormData({
      ...formData,
      composition: {
        ...formData.composition,
        [element]: { min: 0, max: 0 },
      },
    });
  };

  const handleRemoveElement = (element) => {
    const newComposition = { ...formData.composition };
    delete newComposition[element];
    setFormData({ ...formData, composition: newComposition });
  };

  const handleCompositionChange = (element, field, value) => {
    setFormData({
      ...formData,
      composition: {
        ...formData.composition,
        [element]: {
          ...formData.composition[element],
          [field]: parseFloat(value) || 0,
        },
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingGrade) {
        await updateGrade(editingGrade._id, formData);
        toast.success("Grade updated successfully");
      } else {
        await createGrade(formData);
        toast.success("Grade created successfully");
      }
      handleCloseModal();
      refreshGrades();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save grade");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this grade?")) return;

    try {
      await deleteGrade(id);
      toast.success("Grade deleted successfully");
      refreshGrades();
    } catch (error) {
      toast.error("Failed to delete grade");
    }
  };

  const columns = [
    {
      header: "Grade Name",
      accessor: "gradeName",
      render: (row) => (
        <span className="font-mono font-semibold">{row.gradeName}</span>
      ),
    },
    {
      header: "Description",
      accessor: "description",
      render: (row) => (
        <span className="text-dark-600">{row.description || "N/A"}</span>
      ),
    },
    {
      header: "Elements",
      render: (row) => (
        <span className="text-dark-600">
          {Object.keys(row.composition || {}).join(", ")}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleOpenModal(row)}
          >
            <Edit size={16} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDelete(row._id)}
          >
            <Trash2 size={16} className="text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  const availableElements = ELEMENT_SYMBOLS.filter(
    (el) => !Object.keys(formData.composition).includes(el)
  );

  return (
    <div className="space-y-6">
      <Card
        title="Grade Specifications"
        actions={
          <Button onClick={() => handleOpenModal()}>
            <Plus size={18} className="inline mr-2" />
            Add New Grade
          </Button>
        }
      >
        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search grades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-dark-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Table */}
        <Table columns={columns} data={filteredGrades} loading={loading} />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingGrade ? "Edit Grade" : "Add New Grade"}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Grade Name"
            value={formData.gradeName}
            onChange={(e) =>
              setFormData({ ...formData, gradeName: e.target.value })
            }
            required
            disabled={editingGrade !== null}
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-dark-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-dark-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-dark-700 mb-2">
              Composition
            </label>

            {/* Add Element Dropdown */}
            {availableElements.length > 0 && (
              <div className="mb-3">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddElement(e.target.value);
                      e.target.value = "";
                    }
                  }}
                  className="w-full px-3 py-2 border border-dark-300 rounded-lg"
                >
                  <option value="">+ Add Element</option>
                  {availableElements.map((el) => (
                    <option key={el} value={el}>
                      {el}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Composition Table */}
            {Object.keys(formData.composition).length > 0 ? (
              <div className="border border-dark-300 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-dark-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-dark-500">
                        Element
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-dark-500">
                        Min %
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-dark-500">
                        Max %
                      </th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-200">
                    {Object.entries(formData.composition).map(
                      ([element, range]) => (
                        <tr key={element}>
                          <td className="px-4 py-2 font-mono font-semibold">
                            {element}
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              step="0.01"
                              value={range.min}
                              onChange={(e) =>
                                handleCompositionChange(
                                  element,
                                  "min",
                                  e.target.value
                                )
                              }
                              className="w-full px-2 py-1 border border-dark-300 rounded"
                              required
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              step="0.01"
                              value={range.max}
                              onChange={(e) =>
                                handleCompositionChange(
                                  element,
                                  "max",
                                  e.target.value
                                )
                              }
                              className="w-full px-2 py-1 border border-dark-300 rounded"
                              required
                            />
                          </td>
                          <td className="px-4 py-2">
                            <button
                              type="button"
                              onClick={() => handleRemoveElement(element)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-dark-500 italic">
                No elements added yet
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="secondary"
              onClick={handleCloseModal}
              type="button"
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingGrade ? "Update" : "Create"} Grade
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GradeSpecs;
