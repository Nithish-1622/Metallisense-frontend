import React, { useState, useContext } from "react";
import { GradeContext } from "../context/GradeContext";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Select from "../components/common/Select";
import Badge from "../components/common/Badge";
import { analyzeAgent } from "../services/aiService";
import toast from "react-hot-toast";
import { ELEMENT_SYMBOLS } from "../utils/constants";
import { formatPercentage } from "../utils/formatters";

const AIAgent = () => {
  const { grades } = useContext(GradeContext);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [composition, setComposition] = useState({});
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

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
      const response = await analyzeAgent({
        reading: composition,
        gradeName: selectedGrade,
      });

      setResult(response.data.data);
      toast.success("AI Agent analysis completed");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to complete analysis"
      );
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card title="Reading Input">
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
            🤖 Run Full Analysis
          </Button>
        </div>
      </Card>

      {/* Agent Response */}
      {result && (
        <Card title="AI Agent Response">
          <div className="space-y-6">
            {/* Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-dark-50 rounded-lg">
                <p className="text-sm font-medium text-dark-600 mb-2">
                  Quality Status
                </p>
                <Badge
                  variant={result.quality_pass ? "success" : "error"}
                  className="text-lg"
                >
                  {result.quality_pass ? "✓ Pass" : "✗ Fail"}
                </Badge>
              </div>

              <div className="p-4 bg-dark-50 rounded-lg">
                <p className="text-sm font-medium text-dark-600 mb-2">
                  Anomaly Status
                </p>
                <Badge
                  variant={result.anomaly_detected ? "error" : "success"}
                  className="text-lg"
                >
                  {result.anomaly_detected ? "⚠️ Detected" : "✓ None"}
                </Badge>
              </div>

              <div className="p-4 bg-dark-50 rounded-lg">
                <p className="text-sm font-medium text-dark-600 mb-2">
                  Grade Match
                </p>
                <p className="text-lg font-bold text-dark-900 font-mono">
                  {result.predicted_grade || selectedGrade}
                </p>
              </div>
            </div>

            {/* Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-3">
                  Recommendations
                </h3>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-blue-800"
                    >
                      <span className="text-blue-600">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggested Actions */}
            {result.actions && result.actions.length > 0 && (
              <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-3">
                  Suggested Actions
                </h3>
                <ul className="space-y-2">
                  {result.actions.map((action, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-green-800"
                    >
                      <span className="text-green-600">→</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Analysis Details */}
            {result.analysis_details && (
              <div className="p-6 bg-dark-50 rounded-lg">
                <h3 className="font-semibold text-dark-900 mb-3">
                  Analysis Details
                </h3>
                <p className="text-dark-700 whitespace-pre-wrap">
                  {result.analysis_details}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AIAgent;
