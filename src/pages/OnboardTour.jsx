import React, { useState, useEffect } from "react";
import Joyride from "react-joyride";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { useNavigate } from "react-router-dom";

const OnboardTour = () => {
  const navigate = useNavigate();
  const [runTour, setRunTour] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem("onboardTourCompleted");
    setTourCompleted(completed === "true");
  }, []);

  const steps = [
    {
      target: "body",
      content: (
        <div>
          <h2 className="text-2xl font-bold mb-3">
            Welcome to MetalliSense! 🚀
          </h2>
          <p>
            MetalliSense is an industrial-grade metal analysis and quality
            control system that integrates with OPC UA servers for real-time
            spectrometer readings.
          </p>
        </div>
      ),
      placement: "center",
    },
    {
      target: '[data-tour="sidebar"]',
      content:
        "Use this sidebar to navigate between different sections of the application.",
    },
    {
      target: '[data-tour="opc-status"]',
      content:
        "Monitor your OPC server connection status here. The indicator updates every 3 seconds.",
    },
  ];

  const handleStartTour = () => {
    setRunTour(true);
  };

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if (status === "finished" || status === "skipped") {
      setRunTour(false);
      localStorage.setItem("onboardTourCompleted", "true");
      setTourCompleted(true);
    }
  };

  return (
    <div className="space-y-6">
      <Joyride
        steps={steps}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: "#16a34a",
            zIndex: 10000,
          },
        }}
      />

      <Card title="Welcome to MetalliSense">
        <div className="space-y-6">
          <div className="text-center py-8">
            <h1 className="text-4xl font-bold text-primary-600 mb-4">
              MetalliSense
            </h1>
            <p className="text-lg text-dark-600 mb-8 max-w-2xl mx-auto">
              Industrial-grade metal analysis and quality control system with
              AI-powered anomaly detection, alloy recommendations, and real-time
              OPC UA integration.
            </p>

            {!tourCompleted ? (
              <Button onClick={handleStartTour} size="lg">
                Start Interactive Tour
              </Button>
            ) : (
              <div>
                <Button onClick={handleStartTour} size="lg" variant="outline">
                  Restart Tour
                </Button>
                <p className="text-sm text-dark-500 mt-4">
                  Tour completed! You can restart it anytime.
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <div className="p-6 bg-primary-50 rounded-lg border border-primary-200">
              <h3 className="font-semibold text-primary-900 mb-2">
                🔍 Anomaly Detection
              </h3>
              <p className="text-sm text-primary-700">
                Detect anomalies in spectrometer readings with AI-powered
                analysis.
              </p>
            </div>

            <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">
                💡 Alloy Recommendations
              </h3>
              <p className="text-sm text-blue-700">
                Get AI-powered grade recommendations based on composition.
              </p>
            </div>

            <div className="p-6 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">🤖 AI Agent</h3>
              <p className="text-sm text-green-700">
                Comprehensive AI analysis with quality assessment and
                suggestions.
              </p>
            </div>

            <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-2">
                📊 Grade Specs
              </h3>
              <p className="text-sm text-purple-700">
                Manage metal grade specifications and composition ranges.
              </p>
            </div>

            <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-900 mb-2">
                ⚡ Synthetic Data
              </h3>
              <p className="text-sm text-yellow-700">
                Generate synthetic readings with controlled deviations.
              </p>
            </div>

            <div className="p-6 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-900 mb-2">
                🔬 Spectrometer
              </h3>
              <p className="text-sm text-red-700">
                Manage real-time OPC readings and spectrometer data.
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <Button onClick={() => navigate("/dashboard")} size="lg">
              Go to Dashboard
            </Button>
            <Button
              onClick={() => navigate("/anomaly")}
              size="lg"
              variant="outline"
            >
              Try Anomaly Detection
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OnboardTour;
