import React, { useState } from "react";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import SyntheticGenerator from "../components/common/SyntheticGenerator";
import { analyzeAgent } from "../services/aiService";
import toast from "react-hot-toast";
import { formatPercentage } from "../utils/formatters";

const AIAgent = () => {
  const [result, setResult] = useState(null);
  const [aiAvailable, setAIAvailable] = useState(true);

  const handleGenerate = async (reading, params) => {
    console.log("AI Agent: handleGenerate called with:", { reading, params });

    try {
      // Use params which contains the request data
      const requestData = {
        metalGrade: reading.metalGrade || params.metalGrade,
        deviationElements:
          reading.deviationElements || params.deviationElements,
        deviationPercentage:
          reading.deviationPercentage || params.deviationPercentage,
      };

      console.log("AI Agent: Sending to AI:", requestData);

      // Analyze using AI Agent endpoint
      const response = await analyzeAgent(requestData);

      console.log("AI Agent: Response:", response.data);

      const data = response.data.data;
      setResult(data);

      // Check AI service availability
      if (!data.aiAnalysis.serviceAvailable) {
        setAIAvailable(false);
        toast.warning(
          "AI Agent service is experiencing issues. Results may be incomplete."
        );
      } else {
        setAIAvailable(true);
        toast.success("AI Agent analysis completed successfully");
      }
    } catch (error) {
      console.error("AI Agent analysis failed:", error);
      console.error("Error details:", error.response?.data);
      toast.error(
        error.response?.data?.message || "Failed to complete AI Agent analysis"
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-900">
            🤖 AI Agent Analysis
          </h1>
          <p className="text-dark-600 mt-1">
            Coordinated AI agent with combined insights, quality assessment, and
            actionable recommendations
          </p>
        </div>

        {/* AI Status Badge */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            aiAvailable
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              aiAvailable ? "bg-green-500" : "bg-red-500"
            }`}
          ></span>
          <span className="font-medium text-sm">
            AI Agent: {aiAvailable ? "Online" : "Offline"}
          </span>
        </div>
      </div>

      {/* Synthetic Generator */}
      <SyntheticGenerator
        onDataGenerated={handleGenerate}
        buttonText="🤖 Generate & Run AI Agent Analysis"
      />

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* AI Service Warning */}
          {!result.aiAnalysis.serviceAvailable && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-red-600 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800">
                    AI Agent Service Unavailable
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    The AI Agent service is currently offline. Human approval
                    required for all decisions.
                  </p>
                  {result.aiAnalysis.error && (
                    <p className="text-xs text-red-600 mt-2 font-mono">
                      Error: {result.aiAnalysis.error}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quality Assessment Overview */}
          <Card title="Quality Assessment">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Overall Status */}
              <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-700 mb-2">
                  Overall Status
                </p>
                <p
                  className={`text-2xl font-bold ${
                    result.aiAnalysis.agentResponse?.quality_assessment
                      ?.overall_status === "ACCEPTABLE"
                      ? "text-green-600"
                      : result.aiAnalysis.agentResponse?.quality_assessment
                          ?.overall_status === "UNACCEPTABLE"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {result.aiAnalysis.agentResponse?.quality_assessment
                    ?.overall_status || "N/A"}
                </p>
              </div>

              {/* Compliance Score */}
              <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                <p className="text-sm font-medium text-purple-700 mb-2">
                  Compliance Score
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {result.aiAnalysis.agentResponse?.quality_assessment
                    ?.compliance_score
                    ? `${result.aiAnalysis.agentResponse.quality_assessment.compliance_score.toFixed(
                        1
                      )}%`
                    : "N/A"}
                </p>
              </div>

              {/* Risk Level */}
              <div className="p-5 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                <p className="text-sm font-medium text-orange-700 mb-2">
                  Risk Level
                </p>
                <Badge
                  variant={
                    result.aiAnalysis.agentResponse?.risk_level === "LOW"
                      ? "success"
                      : result.aiAnalysis.agentResponse?.risk_level === "MEDIUM"
                      ? "warning"
                      : result.aiAnalysis.agentResponse?.risk_level === "HIGH"
                      ? "danger"
                      : "info"
                  }
                  className="text-lg"
                >
                  {result.aiAnalysis.agentResponse?.risk_level || "UNKNOWN"}
                </Badge>
              </div>

              {/* Human Approval */}
              <div className="p-5 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg border border-pink-200">
                <p className="text-sm font-medium text-pink-700 mb-2">
                  Human Approval
                </p>
                <p
                  className={`text-lg font-bold ${
                    result.aiAnalysis.agentResponse?.human_approval_required
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {result.aiAnalysis.agentResponse?.human_approval_required
                    ? "⚠️ Required"
                    : "✓ Not Required"}
                </p>
              </div>
            </div>
          </Card>

          {/* Final Recommendation */}
          {result.aiAnalysis.agentResponse?.final_recommendation && (
            <Card title="Final Recommendation">
              <div className="p-6 bg-gradient-to-r from-primary-50 to-primary-100 border-l-4 border-primary-500 rounded-lg">
                <p className="text-2xl font-bold text-primary-900">
                  {result.aiAnalysis.agentResponse.final_recommendation}
                </p>
              </div>
            </Card>
          )}

          {/* Anomaly Agent Analysis */}
          {result.aiAnalysis.agentResponse?.anomaly_agent && (
            <Card title="Anomaly Detection Analysis">
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-dark-50 rounded-lg">
                    <p className="text-sm text-dark-600 mb-1">Anomaly Score</p>
                    <p className="text-xl font-bold text-dark-900">
                      {result.aiAnalysis.agentResponse.anomaly_agent
                        .anomaly_score !== null
                        ? result.aiAnalysis.agentResponse.anomaly_agent.anomaly_score.toFixed(
                            3
                          )
                        : "N/A"}
                    </p>
                  </div>
                  <div className="p-4 bg-dark-50 rounded-lg">
                    <p className="text-sm text-dark-600 mb-1">Is Anomaly</p>
                    <Badge
                      variant={
                        result.aiAnalysis.agentResponse.anomaly_agent.is_anomaly
                          ? "danger"
                          : "success"
                      }
                    >
                      {result.aiAnalysis.agentResponse.anomaly_agent.is_anomaly
                        ? "Yes"
                        : "No"}
                    </Badge>
                  </div>
                  <div className="p-4 bg-dark-50 rounded-lg">
                    <p className="text-sm text-dark-600 mb-1">Severity</p>
                    <Badge
                      variant={
                        result.aiAnalysis.agentResponse.anomaly_agent
                          .severity === "LOW"
                          ? "success"
                          : result.aiAnalysis.agentResponse.anomaly_agent
                              .severity === "MEDIUM"
                          ? "warning"
                          : result.aiAnalysis.agentResponse.anomaly_agent
                              .severity === "HIGH"
                          ? "danger"
                          : "info"
                      }
                    >
                      {result.aiAnalysis.agentResponse.anomaly_agent.severity}
                    </Badge>
                  </div>
                  <div className="p-4 bg-dark-50 rounded-lg">
                    <p className="text-sm text-dark-600 mb-1">Confidence</p>
                    <p className="text-xl font-bold text-dark-900">
                      {result.aiAnalysis.agentResponse.anomaly_agent
                        .confidence !== null
                        ? `${(
                            result.aiAnalysis.agentResponse.anomaly_agent
                              .confidence * 100
                          ).toFixed(1)}%`
                        : "N/A"}
                    </p>
                  </div>
                </div>
                {result.aiAnalysis.agentResponse.anomaly_agent.explanation && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      {
                        result.aiAnalysis.agentResponse.anomaly_agent
                          .explanation
                      }
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Alloy Agent Analysis */}
          {result.aiAnalysis.agentResponse?.alloy_agent && (
            <Card title="Alloy Correction Analysis">
              <div className="space-y-4">
                {/* Recommended Additions */}
                {result.aiAnalysis.agentResponse.alloy_agent
                  .recommended_additions &&
                  Object.keys(
                    result.aiAnalysis.agentResponse.alloy_agent
                      .recommended_additions
                  ).length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-dark-700 mb-3">
                        Recommended Element Adjustments
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {Object.entries(
                          result.aiAnalysis.agentResponse.alloy_agent
                            .recommended_additions
                        ).map(([element, value]) => (
                          <div
                            key={element}
                            className={`p-3 rounded-lg border-2 ${
                              value > 0
                                ? "bg-green-50 border-green-200"
                                : value < 0
                                ? "bg-red-50 border-red-200"
                                : "bg-gray-50 border-gray-200"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-mono font-bold text-dark-900">
                                {element}
                              </span>
                              {value !== 0 && (
                                <Badge
                                  variant={value > 0 ? "success" : "danger"}
                                  className="text-xs"
                                >
                                  {value > 0 ? "Add" : "Reduce"}
                                </Badge>
                              )}
                            </div>
                            <p
                              className={`text-xl font-bold ${
                                value > 0
                                  ? "text-green-600"
                                  : value < 0
                                  ? "text-red-600"
                                  : "text-gray-500"
                              }`}
                            >
                              {value > 0 ? "+" : ""}
                              {formatPercentage(value)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Confidence */}
                {result.aiAnalysis.agentResponse.alloy_agent.confidence !==
                  null && (
                  <div className="p-4 bg-dark-50 rounded-lg">
                    <p className="text-sm text-dark-600 mb-2">
                      Correction Confidence
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-dark-200 rounded-full h-4">
                        <div
                          className="h-4 rounded-full bg-primary-500 transition-all duration-500"
                          style={{
                            width: `${
                              (result.aiAnalysis.agentResponse.alloy_agent
                                .confidence || 0) * 100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-xl font-bold text-primary-600 min-w-[70px] text-right">
                        {(
                          result.aiAnalysis.agentResponse.alloy_agent
                            .confidence * 100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                  </div>
                )}

                {/* Explanation */}
                {result.aiAnalysis.agentResponse.alloy_agent.explanation && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-900">
                      {result.aiAnalysis.agentResponse.alloy_agent.explanation}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Quality Assessment Details */}
          {result.aiAnalysis.agentResponse?.quality_assessment && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Issues */}
              {result.aiAnalysis.agentResponse.quality_assessment.issues &&
                result.aiAnalysis.agentResponse.quality_assessment.issues
                  .length > 0 && (
                  <Card title="⚠️ Issues Detected">
                    <div className="space-y-3">
                      {result.aiAnalysis.agentResponse.quality_assessment.issues.map(
                        (issue, index) => (
                          <div
                            key={index}
                            className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                          >
                            <div className="flex items-start gap-2">
                              <Badge variant="warning" className="mt-0.5">
                                {issue.element}
                              </Badge>
                              <div className="flex-1">
                                <p className="font-medium text-yellow-900">
                                  {issue.issue}
                                </p>
                                <p className="text-sm text-yellow-700 mt-1">
                                  Severity:{" "}
                                  <span className="font-semibold">
                                    {issue.severity}
                                  </span>
                                </p>
                                {issue.impact && (
                                  <p className="text-xs text-yellow-600 mt-1">
                                    Impact: {issue.impact}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </Card>
                )}

              {/* Strengths */}
              {result.aiAnalysis.agentResponse.quality_assessment.strengths &&
                result.aiAnalysis.agentResponse.quality_assessment.strengths
                  .length > 0 && (
                  <Card title="✅ Strengths">
                    <div className="space-y-2">
                      {result.aiAnalysis.agentResponse.quality_assessment.strengths.map(
                        (strength, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg"
                          >
                            <svg
                              className="w-5 h-5 text-green-600 mt-0.5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <p className="text-sm text-green-800">{strength}</p>
                          </div>
                        )
                      )}
                    </div>
                  </Card>
                )}
            </div>
          )}

          {/* Suggested Actions */}
          {result.aiAnalysis.agentResponse?.suggested_actions &&
            result.aiAnalysis.agentResponse.suggested_actions.length > 0 && (
              <Card title="📋 Suggested Actions">
                <div className="space-y-3">
                  {result.aiAnalysis.agentResponse.suggested_actions.map(
                    (action, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-4 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-500 text-white font-bold text-sm flex-shrink-0">
                          {index + 1}
                        </div>
                        <p className="text-dark-800 flex-1 pt-1">{action}</p>
                      </div>
                    )
                  )}
                </div>
              </Card>
            )}

          {/* Generated Composition */}
          <Card title="Generated Synthetic Reading">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-dark-200">
                <div>
                  <h3 className="text-sm font-medium text-dark-600">
                    Metal Grade
                  </h3>
                  <p className="text-lg font-bold text-dark-900 font-mono">
                    {result.syntheticReading.metalGrade}
                  </p>
                </div>
                <div className="text-right">
                  <h3 className="text-sm font-medium text-dark-600">
                    Deviation Applied
                  </h3>
                  <p className="text-lg font-bold text-primary-600">
                    {result.syntheticReading.deviationPercentage}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Object.entries(result.syntheticReading.composition).map(
                  ([element, value]) => {
                    const isDeviated =
                      result.syntheticReading.deviationElements?.includes(
                        element
                      );
                    return (
                      <div
                        key={element}
                        className={`p-3 rounded-lg ${
                          isDeviated
                            ? "bg-yellow-50 border-2 border-yellow-300"
                            : "bg-dark-50 border border-dark-200"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-sm text-dark-900">
                            {element}
                          </span>
                          {isDeviated && (
                            <Badge variant="warning" className="text-xs">
                              Deviated
                            </Badge>
                          )}
                        </div>
                        <p className="text-lg font-bold text-dark-900">
                          {formatPercentage(value)}
                        </p>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AIAgent;
