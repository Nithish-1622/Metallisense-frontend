import React, { useState, useContext } from "react";
import { GradeContext } from "../context/GradeContext";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Select from "../components/common/Select";
import Badge from "../components/common/Badge";
import Table from "../components/common/Table";
import { analyzeIndividual } from "../services/aiService";
import toast from "react-hot-toast";
import { ELEMENT_SYMBOLS } from "../utils/constants";
import {
  formatPercentage,
  formatConfidence,
  formatDate,
} from "../utils/formatters";

const AnomalyDetection = () => {
  const { grades } = useContext(GradeContext);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [composition, setComposition] = useState({});
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [history, setHistory] = useState([]);

  const gradeOptions = grades.map((g) => ({
    value: g.gradeName,
    label: g.gradeName,
  }));

  const handleCompositionChange = (element, value) => {
    setComposition({
      ...composition,
      [element]: parseFloat(value) || 0,
    });
  };

  const handleAnalyze = async () => {
    if (!selectedGrade) {
      toast.error("Please select a grade");
      return;
    }

    if (Object.keys(composition).length === 0) {
      toast.error("Please enter composition data");
      return;
    }

    setAnalyzing(true);
    try {
      const response = await analyzeIndividual({
        reading: composition,
        gradeName: selectedGrade,
      });

      const analysisResult = {
        ...response.data.data,
        gradeName: selectedGrade,
        composition,
        timestamp: new Date(),
      };

      setResult(analysisResult);
      setHistory([analysisResult, ...history]);
      toast.success("Analysis completed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to analyze reading");
    } finally {
      setAnalyzing(false);
    }
  };

  const historyColumns = [
    {
      header: "Timestamp",
      render: (row) => (
        <span className="text-sm">{formatDate(row.timestamp)}</span>
      ),
    },
    {
      header: "Grade",
      render: (row) => (
        <span className="font-mono font-semibold">{row.gradeName}</span>
      ),
    },
    {
      header: "Status",
      render: (row) => (
        <Badge variant={row.anomalyDetection?.is_anomaly ? "error" : "success"}>
          {row.anomalyDetection?.is_anomaly ? "Anomaly" : "Normal"}
        </Badge>
      ),
    },
    {
      header: "Score",
      render: (row) => (
        <span className="font-mono">
          {row.anomalyDetection?.anomaly_score?.toFixed(2)}
        </span>
      ),
    },
    {
      header: "Confidence",
      render: (row) => (
        <span className="font-mono">
          {formatConfidence(row.anomalyDetection?.confidence)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card title="Anomaly Detection Input">
        <div className="space-y-6">
          <Select
            label="Select Grade"
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            options={[
              { value: "", label: "Select a grade..." },
              ...gradeOptions,
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-dark-700 mb-3">
              Element Composition (%)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {ELEMENT_SYMBOLS.map((element) => (
                <Input
                  key={element}
                  label={element}
                  type="number"
                  step="0.01"
                  value={composition[element] || ""}
                  onChange={(e) =>
                    handleCompositionChange(element, e.target.value)
                  }
                  containerClassName="mb-0"
                />
              ))}
            </div>
          </div>

          <Button
            onClick={handleAnalyze}
            loading={analyzing}
            className="w-full"
          >
            Analyze for Anomalies
          </Button>
        </div>
      </Card>

      {/* Results */}
      {result && (
        <Card title="Analysis Results">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-dark-50 rounded-lg">
              <p className="text-sm font-medium text-dark-600 mb-2">Status</p>
              <Badge
                variant={
                  result.anomalyDetection.is_anomaly ? "error" : "success"
                }
                className="text-lg px-4 py-2"
              >
                {result.anomalyDetection.is_anomaly
                  ? "⚠️ Anomaly Detected"
                  : "✓ Normal"}
              </Badge>
            </div>

            <div className="p-6 bg-dark-50 rounded-lg">
              <p className="text-sm font-medium text-dark-600 mb-2">
                Anomaly Score
              </p>
              <p className="text-3xl font-bold text-dark-900">
                {result.anomalyDetection.anomaly_score?.toFixed(2)}
              </p>
              <div className="mt-2 w-full bg-dark-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    result.anomalyDetection.anomaly_score > 0.5
                      ? "bg-red-500"
                      : "bg-green-500"
                  }`}
                  style={{
                    width: `${result.anomalyDetection.anomaly_score * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="p-6 bg-dark-50 rounded-lg">
              <p className="text-sm font-medium text-dark-600 mb-2">
                Confidence
              </p>
              <p className="text-3xl font-bold text-dark-900">
                {formatConfidence(result.anomalyDetection.confidence)}
              </p>
              <div className="mt-2 w-full bg-dark-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-primary-500"
                  style={{
                    width: `${result.anomalyDetection.confidence * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {result.alloyRecommendation && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-semibold text-blue-900 mb-2">
                Predicted Grade: {result.alloyRecommendation.predicted_grade}
              </p>
              <p className="text-sm text-blue-700">
                Confidence:{" "}
                {formatConfidence(result.alloyRecommendation.confidence)}
              </p>
            </div>
          )}
        </Card>
      )}

      {/* History */}
      {history.length > 0 && (
        <Card title="Recent Analysis History">
          <Table columns={historyColumns} data={history} />
        </Card>
      )}
    </div>
  );
};

export default AnomalyDetection;
