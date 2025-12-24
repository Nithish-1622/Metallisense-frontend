import React, { useState } from "react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Badge from "../components/common/Badge";
import { analyzeIndividual } from "../services/aiService";
import toast from "react-hot-toast";
import { ELEMENT_SYMBOLS } from "../utils/constants";
import { formatPercentage, formatConfidence } from "../utils/formatters";

const Recommendation = () => {
  const [composition, setComposition] = useState({});
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleCompositionChange = (element, value) => {
    setComposition({
      ...composition,
      [element]: parseFloat(value) || 0,
    });
  };

  const handleAnalyze = async () => {
    if (Object.keys(composition).length === 0) {
      toast.error("Please enter composition data");
      return;
    }

    setAnalyzing(true);
    try {
      const response = await analyzeIndividual({
        reading: composition,
        gradeName: "", // Not required for recommendation
      });

      setResult(response.data.data);
      toast.success("Recommendation generated");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to generate recommendation"
      );
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card title="Input Composition">
        <div className="space-y-6">
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
            Get Recommendations
          </Button>
        </div>
      </Card>

      {/* Results */}
      {result?.alloyRecommendation && (
        <div className="space-y-6">
          {/* Predicted Grade */}
          <Card title="Predicted Grade">
            <div className="text-center p-6">
              <h2 className="text-4xl font-bold text-primary-600 mb-4">
                {result.alloyRecommendation.predicted_grade}
              </h2>
              <div className="inline-block">
                <p className="text-sm text-dark-600 mb-2">Confidence</p>
                <div className="flex items-center gap-3">
                  <div className="w-64 bg-dark-200 rounded-full h-4">
                    <div
                      className="h-4 rounded-full bg-primary-500"
                      style={{
                        width: `${
                          result.alloyRecommendation.confidence * 100
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-2xl font-bold text-primary-600">
                    {formatConfidence(result.alloyRecommendation.confidence)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Alternative Grades */}
          {result.alloyRecommendation.alternative_grades && (
            <Card title="Alternative Grades">
              <div className="space-y-3">
                {result.alloyRecommendation.alternative_grades.map(
                  (grade, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-dark-50 rounded-lg hover:bg-dark-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-dark-400">
                          #{index + 1}
                        </span>
                        <span className="text-lg font-semibold text-dark-900 font-mono">
                          {typeof grade === "string" ? grade : grade.name}
                        </span>
                      </div>
                      {typeof grade === "object" && grade.confidence && (
                        <Badge variant="info">
                          {formatConfidence(grade.confidence)}
                        </Badge>
                      )}
                    </div>
                  )
                )}
              </div>
            </Card>
          )}

          {/* Input Composition Summary */}
          <Card title="Input Composition">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Object.entries(composition)
                .filter(([_, value]) => value > 0)
                .map(([element, value]) => (
                  <div key={element} className="p-4 bg-dark-50 rounded-lg">
                    <span className="font-mono font-bold text-sm text-dark-600">
                      {element}
                    </span>
                    <p className="text-xl font-bold text-dark-900 mt-1">
                      {formatPercentage(value)}
                    </p>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Recommendation;
