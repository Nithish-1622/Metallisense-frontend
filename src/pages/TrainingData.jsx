import React, { useState, useEffect } from "react";
import Card from "../components/common/Card";
import Table from "../components/common/Table";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import {
  getAllTrainingData,
  getGradeStatistics,
  deleteTrainingData,
} from "../services/trainingDataService";
import toast from "react-hot-toast";
import { formatDate } from "../utils/formatters";
import { Trash2 } from "lucide-react";

const TrainingData = () => {
  const [trainingData, setTrainingData] = useState([]);
  const [statistics, setStatistics] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getAllTrainingData();
      setTrainingData(response.data.data || []);

      // Get unique grades and fetch their statistics
      const grades = [
        ...new Set((response.data.data || []).map((d) => d.gradeName)),
      ];
      const statsPromises = grades.map((grade) => getGradeStatistics(grade));
      const statsResponses = await Promise.all(statsPromises);

      const stats = statsResponses.map((res, index) => ({
        grade: grades[index],
        count: res.data.data?.count || 0,
        avgQuality: res.data.data?.avgQuality || 0,
      }));

      setStatistics(stats);
    } catch (error) {
      console.error("Failed to fetch training data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this training data?"))
      return;

    try {
      await deleteTrainingData(id);
      toast.success("Training data deleted successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete training data");
    }
  };

  const statsColumns = [
    {
      header: "Grade",
      render: (row) => (
        <span className="font-mono font-semibold">{row.grade}</span>
      ),
    },
    {
      header: "Count",
      render: (row) => (
        <span className="font-bold text-primary-600">{row.count}</span>
      ),
    },
    {
      header: "Avg Quality",
      render: (row) => (
        <Badge variant="success">{row.avgQuality.toFixed(1)}%</Badge>
      ),
    },
  ];

  const dataColumns = [
    {
      header: "ID",
      render: (row) => (
        <span className="font-mono text-xs text-dark-500">
          {row._id?.slice(-8) || "N/A"}
        </span>
      ),
    },
    {
      header: "Grade",
      render: (row) => (
        <span className="font-mono font-semibold">{row.gradeName}</span>
      ),
    },
    {
      header: "Elements",
      render: (row) => (
        <span className="text-sm text-dark-600">
          {Object.keys(row.composition || row.elements || {}).join(", ")}
        </span>
      ),
    },
    {
      header: "Created",
      render: (row) => (
        <span className="text-sm">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      header: "Actions",
      render: (row) => (
        <Button size="sm" variant="ghost" onClick={() => handleDelete(row._id)}>
          <Trash2 size={16} className="text-red-600" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <Card title="Statistics by Grade">
        <Table columns={statsColumns} data={statistics} loading={loading} />
      </Card>

      {/* Training Data Records */}
      <Card title="Training Data Records">
        <Table
          columns={dataColumns}
          data={trainingData}
          loading={loading}
          emptyMessage="No training data available"
        />
      </Card>
    </div>
  );
};

export default TrainingData;
