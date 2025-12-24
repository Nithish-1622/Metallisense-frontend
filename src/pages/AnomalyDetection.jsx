import { useState } from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import Table from "../components/common/Table";
import SyntheticGenerator from "../components/common/SyntheticGenerator";
import { analyzeIndividual } from "../services/aiService";
import toast from "react-hot-toast";
import { formatPercentage } from "../utils/formatters";

const AnomalyDetection = () => {
  const [generatedReading, setGeneratedReading] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleSyntheticDataGenerated = async (reading, params) => {
    setGeneratedReading(reading);

    // Automatically analyze the generated reading
    await performAnalysis(reading);
  };

  const performAnalysis = async (reading) => {
    setAnalyzing(true);
    try {
      const response = await analyzeIndividual({
        metalGrade: reading.metalGrade,
        composition: reading.composition,
      });

      if (response.data) {
        const result = response.data.data || response.data;
        setAnalysisResult(result);

        const anomalyStatus = result.anomalyDetection?.isAnomaly
          ? "Anomaly Detected"
          : "No Anomaly";
        toast.success(`Analysis complete: ${anomalyStatus}`);
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      toast.error(
        error.response?.data?.message || "Failed to analyze composition"
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const getComplianceColor = (compliance) => {
    if (compliance >= 90) return "text-green-600";
    if (compliance >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark-900">Anomaly Detection</h1>
        <p className="text-dark-600 mt-1">
          Generate synthetic readings and detect composition anomalies
        </p>
      </div>

      {/* Synthetic Generator */}
      <SyntheticGenerator
        onDataGenerated={handleSyntheticDataGenerated}
        buttonText="Generate & Analyze"
      />

      {/* Analysis Loading */}
      {analyzing && (
        <Card>
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            <span className="text-dark-700">
              Analyzing composition for anomalies...
            </span>
          </div>
        </Card>
      )}

      {/* Generated Reading & Analysis Results */}
      {generatedReading && (
        <>
          {/* Generated Reading Card */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-dark-900">
                Generated Reading
              </h3>
              <Badge variant="info">{generatedReading.metalGrade}</Badge>
            </div>

            <div className="space-y-4">
              {/* Composition */}
              <div>
                <p className="text-sm font-medium text-dark-700 mb-2">
                  Composition
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {Object.entries(generatedReading.composition || {}).map(
                    ([element, value]) => {
                      const isDeviated =
                        generatedReading.deviationElements?.includes(element);
                      return (
                        <div
                          key={element}
                          className={`p-3 rounded-lg border-2 ${
                            isDeviated
                              ? "border-yellow-400 bg-yellow-50"
                              : "border-dark-200 bg-dark-50"
                          }`}
                        >
                          <div className="text-xs font-medium text-dark-600">
                            {element}
                          </div>
                          <div
                            className={`text-sm font-mono font-bold ${
                              isDeviated ? "text-yellow-700" : "text-dark-900"
                            }`}
                          >
                            {formatPercentage(value)}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Applied Deviations */}
              {generatedReading.appliedDeviations &&
                generatedReading.appliedDeviations.length > 0 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                    <p className="text-sm font-semibold text-yellow-800 mb-2">
                      Applied Deviations:
                    </p>
                    <div className="space-y-1">
                      {generatedReading.appliedDeviations.map((dev) => (
                        <p
                          key={dev.element}
                          className="text-sm text-yellow-700"
                        >
                          <span className="font-mono font-semibold">
                            {dev.element}
                          </span>
                          : {formatPercentage(dev.original)} →{" "}
                          {formatPercentage(dev.deviated)} (
                          {dev.deviationPercent > 0 ? "+" : ""}
                          {dev.deviationPercent.toFixed(1)}%)
                        </p>
                      ))}
                    </div>
                  </div>
                )}

              {/* Metadata */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-dark-600">Temperature:</span>{" "}
                  <span className="font-mono font-semibold text-dark-900">
                    {generatedReading.temperature}°C
                  </span>
                </div>
                <div>
                  <span className="text-dark-600">Pressure:</span>{" "}
                  <span className="font-mono font-semibold text-dark-900">
                    {generatedReading.pressure} atm
                  </span>
                </div>
                <div>
                  <span className="text-dark-600">Source:</span>{" "}
                  <span className="font-semibold text-dark-900">
                    {generatedReading.source || "training_data"}
                  </span>
                </div>
                <div>
                  <span className="text-dark-600">Timestamp:</span>{" "}
                  <span className="font-mono text-dark-900 text-xs">
                    {new Date(generatedReading.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Analysis Results */}
          {analysisResult && (
            <Card>
              <h3 className="text-lg font-semibold text-dark-900 mb-4">
                Analysis Results
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Anomaly Status */}
                <div className="p-6 bg-dark-50 rounded-lg">
                  <p className="text-sm font-medium text-dark-600 mb-3">
                    Anomaly Status
                  </p>
                  {analysisResult.anomalyDetection?.isAnomaly ||
                  analysisResult.anomalyDetection?.is_anomaly ? (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-8 h-8 text-red-600" />
                      <span className="text-lg font-bold text-red-600">
                        Anomaly Detected
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <span className="text-lg font-bold text-green-600">
                        Normal
                      </span>
                    </div>
                  )}
                </div>

                {/* Anomaly Score */}
                <div className="p-6 bg-dark-50 rounded-lg">
                  <p className="text-sm font-medium text-dark-600 mb-2">
                    Anomaly Score
                  </p>
                  <p className="text-3xl font-bold text-dark-900">
                    {(
                      analysisResult.anomalyDetection?.anomalyScore ||
                      analysisResult.anomalyDetection?.anomaly_score ||
                      0
                    ).toFixed(2)}
                  </p>
                  <div className="mt-3 w-full bg-dark-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        (analysisResult.anomalyDetection?.anomalyScore ||
                          analysisResult.anomalyDetection?.anomaly_score ||
                          0) > 0.5
                          ? "bg-red-500"
                          : "bg-green-500"
                      }`}
                      style={{
                        width: `${
                          (analysisResult.anomalyDetection?.anomalyScore ||
                            analysisResult.anomalyDetection?.anomaly_score ||
                            0) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Confidence */}
                <div className="p-6 bg-dark-50 rounded-lg">
                  <p className="text-sm font-medium text-dark-600 mb-2">
                    Confidence
                  </p>
                  <p className="text-3xl font-bold text-dark-900">
                    {(
                      (analysisResult.anomalyDetection?.confidence || 0) * 100
                    ).toFixed(1)}
                    %
                  </p>
                  <div className="mt-3 w-full bg-dark-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-primary-500"
                      style={{
                        width: `${
                          (analysisResult.anomalyDetection?.confidence || 0) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Compliance Info */}
              {analysisResult.compliance && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-semibold text-blue-800 mb-2">
                    Overall Compliance:{" "}
                    <span
                      className={`text-lg ${getComplianceColor(
                        analysisResult.compliance.overallCompliance
                      )}`}
                    >
                      {analysisResult.compliance.overallCompliance?.toFixed(1)}%
                    </span>
                  </p>
                  <p className="text-sm text-blue-700">
                    {analysisResult.compliance.summary?.compliant || 0} /{" "}
                    {analysisResult.compliance.summary?.total || 0} elements
                    within specification
                  </p>
                </div>
              )}
            </Card>
          )}
        </>
      )}

      {/* Empty State */}
      {!generatedReading && !analyzing && (
        <Card className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-dark-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-dark-900 mb-2">
            No Data Generated
          </h3>
          <p className="text-dark-600">
            Generate a synthetic reading to begin anomaly detection
          </p>
        </Card>
      )}
    </div>
  );
};

export default AnomalyDetection;
